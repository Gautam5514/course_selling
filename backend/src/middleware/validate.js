import { ApiError } from '../utils/apiError.js';

/**
 * Validate req.body / req.query / req.params against Zod schemas.
 * Usage: validate({ body: schema, query: schema, params: schema })
 * Parsed (and coerced) values replace the originals.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      for (const key of ['body', 'query', 'params']) {
        if (schemas[key]) {
          req[key] = schemas[key].parse(req[key]);
        }
      }
      return next();
    } catch (err) {
      if (err?.issues) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return next(ApiError.badRequest('Please check the highlighted fields and try again.', details));
      }
      return next(err);
    }
  };
}
