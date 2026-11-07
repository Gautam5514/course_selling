import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/apiError.js';

/**
 * File storage behind one small interface so the rest of the app never cares
 * where bytes live:
 *   put(multerFile)   → { key, provider, resourceType, url }
 *   remove(uploadDoc) → void (best effort)
 *   open(uploadDoc, { range }) → { status, headers, body: Readable }   (cloudinary only)
 *
 * Local disk is the fallback when Cloudinary credentials are absent.
 */

export const uploadRoot = path.resolve(process.cwd(), config.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);

function extOf(name) {
  return path.extname(name || '').slice(1).toLowerCase();
}

// ─── Local disk ──────────────────────────────────────────────────────────────
const localDriver = {
  name: 'local',
  async put(file) {
    // multer already wrote the file into uploadRoot.
    return { key: file.filename, provider: 'local', resourceType: null, url: null };
  },
  async remove(doc) {
    fs.rm(path.join(uploadRoot, doc.key), { force: true }, () => {});
  },
  filePath(doc) {
    return path.join(uploadRoot, doc.key);
  },
};

// ─── Cloudinary ──────────────────────────────────────────────────────────────
if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

/** Translate Cloudinary SDK errors into friendly API errors. */
function friendlyCloudinaryError(err) {
  const msg = String(err?.message || err?.error?.message || '');
  logger.error({ err: msg, http: err?.http_code }, 'Cloudinary upload failed');
  if (/file size too large|too large/i.test(msg)) {
    const limit = msg.match(/maximum is (\d+)/i)?.[1];
    return ApiError.tooLarge(
      limit
        ? `That file is larger than your storage plan allows (max ${Math.round(Number(limit) / 1024 / 1024)} MB).`
        : 'That file is larger than your storage plan allows.'
    );
  }
  if (err?.http_code === 401 || /invalid signature|api_key|unauthorized/i.test(msg)) {
    return ApiError.unavailable('File storage is not configured correctly. Please check the storage credentials.');
  }
  if (err?.http_code === 420 || /rate limit/i.test(msg)) {
    return ApiError.rateLimited('File storage is busy right now. Please try again in a minute.');
  }
  return ApiError.unavailable('We could not store that file right now. Please try again.');
}

const cloudinaryDriver = {
  name: 'cloudinary',
  async put(file) {
    const ext = extOf(file.originalname);
    const resourceType = IMAGE_EXT.has(ext) ? 'image' : 'raw';
    const base = path.basename(file.filename, path.extname(file.filename));
    // Raw public_ids keep their extension so the delivered file is named sensibly.
    const publicId = `${config.cloudinary.folder}/uploads/${base}${resourceType === 'raw' && ext ? `.${ext}` : ''}`;

    let result;
    try {
      // upload_large (chunked, no practical size ceiling) only reports its
      // result through the callback, so wrap it in a promise ourselves.
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
          file.path,
          {
            public_id: publicId,
            resource_type: resourceType,
            // "private": not reachable by URL at all; we fetch through the
            // signed download API, which also works when an account has PDF/ZIP
            // delivery switched off (the default for new Cloudinary accounts).
            type: 'private',
            overwrite: false,
            chunk_size: 20 * 1024 * 1024,
          },
          (err, res) => (err ? reject(err) : resolve(res))
        );
      });
      if (!result?.public_id) throw new Error('Cloudinary returned no public_id');
    } catch (err) {
      throw friendlyCloudinaryError(err);
    } finally {
      fs.rm(file.path, { force: true }, () => {}); // temp copy no longer needed
    }
    return {
      key: result.public_id,
      provider: 'cloudinary',
      resourceType: result.resource_type,
      format: result.format || (resourceType === 'raw' ? ext : null) || null,
      url: result.secure_url,
    };
  },

  async remove(doc) {
    try {
      await cloudinary.uploader.destroy(doc.key, { resource_type: doc.resourceType || 'raw', type: 'private', invalidate: true });
    } catch (err) {
      logger.warn({ err: err?.message, key: doc.key }, 'Cloudinary destroy failed');
    }
  },

  /** Time-limited download link (10 minutes) for a private asset. */
  signedUrl(doc) {
    return cloudinary.utils.private_download_url(doc.key, doc.format || undefined, {
      resource_type: doc.resourceType || 'raw',
      type: 'private',
      expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
    });
  },

  /** Fetch the bytes from Cloudinary as a stream, honouring Range requests. */
  async open(doc, { range } = {}) {
    const url = this.signedUrl(doc);
    const headers = {};
    if (range) headers.Range = range;
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (err) {
      logger.error({ err: err?.message }, 'Cloudinary fetch failed');
      throw ApiError.unavailable('We could not reach file storage right now. Please try again.');
    }
    if (res.status === 404) throw ApiError.notFound('This file is no longer available.');
    if (res.status === 401 || res.status === 403) {
      logger.error({ status: res.status, key: doc.key }, 'Cloudinary refused delivery');
      throw ApiError.unavailable('This file cannot be delivered right now. Please contact the administrator.');
    }
    if (!res.ok && res.status !== 206) {
      logger.error({ status: res.status, key: doc.key }, 'Cloudinary delivery error');
      throw ApiError.unavailable('We could not load that file right now. Please try again.');
    }
    return {
      status: res.status,
      headers: {
        'Content-Length': res.headers.get('content-length'),
        'Content-Range': res.headers.get('content-range'),
        'Accept-Ranges': res.headers.get('accept-ranges') || 'bytes',
      },
      body: Readable.fromWeb(res.body),
    };
  },
};

export const storage = config.cloudinary.enabled ? cloudinaryDriver : localDriver;
export { localDriver, cloudinaryDriver };
