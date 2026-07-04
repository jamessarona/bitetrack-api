import { type NextFunction, type Request, type Response } from 'express';
import { type ZodSchema } from 'zod';

/**
 * Validates `req.body` against a Zod schema and replaces it with the parsed
 * (coerced/trimmed) value. Validation errors are forwarded to the error handler.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body) as unknown;
      next();
    } catch (error) {
      next(error);
    }
  };
}
