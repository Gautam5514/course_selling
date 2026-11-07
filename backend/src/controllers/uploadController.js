import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { verifyFileSignature } from '../utils/signedUrl.js';
import { Upload } from '../models/Upload.js';
import { storage, uploadRoot, localDriver } from '../storage/index.js';

/**
 * Files an admin may attach to a note: documents, archives of source code,
 * images and plain source files. Executables and scripts are rejected so a
 * stray upload can never be served as something runnable.
 */
export const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'zip', 'tar', 'gz', 'tgz', '7z', 'rar',
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg',
  'md', 'txt', 'json', 'csv', 'yml', 'yaml', 'toml', 'xml',
  'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'java', 'kt', 'c', 'cc', 'cpp', 'h', 'hpp',
  'cs', 'go', 'rs', 'rb', 'php', 'swift', 'dart', 'sql', 'html', 'css', 'scss', 'ipynb',
]);

const diskTemp = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${nanoid(12)}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || '').slice(1).toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(ApiError.badRequest('That file type is not supported. Please upload a PDF, ZIP, image or source file.'));
  }
  return cb(null, true);
}

export const uploadMiddleware = multer({
  storage: diskTemp,
  fileFilter,
  limits: { fileSize: config.maxUploadBytes, files: 1 },
}).single('file');

/** Multer that only accepts a PDF for the "main PDF" slot. */
export const pdfUploadMiddleware = multer({
  storage: diskTemp,
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (ext !== '.pdf' && file.mimetype !== 'application/pdf') {
      return cb(ApiError.badRequest('Please upload a PDF file for the main document.'));
    }
    return cb(null, true);
  },
  limits: { fileSize: config.maxUploadBytes, files: 1 },
}).single('file');

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Best-effort PDF page count without a parser dependency: count page
 * objects. Works for the vast majority of PDFs; returns null when unsure.
 */
async function countPdfPages(filePath) {
  try {
    const buf = await fs.promises.readFile(filePath);
    const text = buf.toString('latin1');
    // Prefer the catalog's declared count when present.
    const declared = text.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/);
    if (declared) return Number(declared[1]) || null;
    const matches = text.match(/\/Type\s*\/Page(?![s\w])/g);
    return matches?.length || null;
  } catch {
    return null;
  }
}

/**
 * Persist a multer file (temporarily on disk) as an Upload document, pushing
 * the bytes to the configured storage (Cloudinary or local disk).
 */
export async function registerUpload(file, ownerId) {
  const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
  // Checksum + page count are computed from the temp copy before it is moved.
  const [checksum, pageCount] = await Promise.all([sha256(file.path), isPdf ? countPdfPages(file.path) : undefined]);
  const stored = await storage.put(file);
  try {
    return await Upload.create({
      owner: ownerId,
      key: stored.key,
      provider: stored.provider,
      resourceType: stored.resourceType,
      format: stored.format ?? null,
      url: stored.url,
      originalName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      byteSize: file.size,
      checksum,
      pageCount: pageCount ?? undefined,
      status: 'READY',
    });
  } catch (err) {
    // Don't leave orphaned bytes behind if the DB write fails.
    await driverFor(stored).remove(stored);
    throw err;
  }
}

function driverFor(doc) {
  return doc.provider === 'cloudinary' ? storage : localDriver;
}

/** Soft-delete an Upload and remove its bytes from storage (best effort). */
export async function discardUpload(uploadId) {
  if (!uploadId) return;
  const doc = await Upload.findOne({ _id: uploadId, deletedAt: null });
  if (!doc) return;
  doc.deletedAt = new Date();
  await doc.save();
  await driverFor(doc).remove(doc);
}

export const createUpload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Please choose a file to upload.');
  const doc = await registerUpload(req.file, req.user._id);
  return sendData(res, doc.toJSON(), 201);
});

export const getUpload = asyncHandler(async (req, res) => {
  const doc = await Upload.findOne({ _id: req.params.id, deletedAt: null });
  if (!doc) throw ApiError.notFound('File not found');
  const data = doc.toJSON();
  data.downloadUrl = `/api/uploads/${doc._id.toString()}/raw`;
  return sendData(res, data);
});

/**
 * Serve a file. Allowed for signed links (reader page) or any signed-in user.
 * PDFs are served inline so they can be read in the browser; `?dl=1` forces
 * a download.
 */
export const downloadUpload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { exp, sig, dl } = req.query;
  const signed = exp && sig && verifyFileSignature(id, exp, sig);
  if (!signed && !req.user) throw ApiError.unauthorized('Please sign in to open this file.');

  const doc = await Upload.findOne({ _id: id, deletedAt: null });
  if (!doc) throw ApiError.notFound('File not found');

  const isPdf = doc.mimeType === 'application/pdf';
  const inline = isPdf && dl !== '1';
  const safeName = doc.originalName.replace(/["\r\n]/g, '_');

  const setFileHeaders = () => {
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${safeName}"`);
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : doc.mimeType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    if (inline) {
      // Allow the frontend to embed the PDF viewer; helmet's defaults block framing.
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${config.corsOrigins.join(' ')}`);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  };

  if (doc.provider === 'cloudinary') {
    // Stream from Cloudinary through this API so the asset stays private and
    // our access rules (signed link or signed-in cookie) always apply.
    const upstream = await storage.open(doc, { range: req.headers.range });
    setFileHeaders();
    for (const [k, v] of Object.entries(upstream.headers)) if (v) res.setHeader(k, v);
    res.status(upstream.status);
    upstream.body.on('error', () => res.destroy());
    req.on('close', () => upstream.body.destroy());
    return upstream.body.pipe(res);
  }

  const filePath = localDriver.filePath(doc);
  if (!fs.existsSync(filePath)) throw ApiError.notFound('This file is no longer available.');
  setFileHeaders();
  return res.sendFile(filePath);
});

export const listUploads = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const docs = await Upload.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(limit);
  return sendData(res, docs.map((d) => d.toJSON()));
});

export const deleteUpload = asyncHandler(async (req, res) => {
  const doc = await Upload.findOne({ _id: req.params.id, deletedAt: null });
  if (!doc) throw ApiError.notFound('File not found');
  await discardUpload(doc._id);
  return sendData(res, { ok: true });
});
