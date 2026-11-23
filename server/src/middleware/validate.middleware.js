import { AppError } from '../utils/appError.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        field: issue.path.slice(1).join('.'),
        message: issue.message,
      }));
      return next(new AppError('Validation error', 400, issues));
    }

    // Assign sanitized / transformed data if any
    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.query) req.query = parsed.data.query;
    if (parsed.data.params) req.params = parsed.data.params;

    next();
  } catch (err) {
    next(err);
  }
};
