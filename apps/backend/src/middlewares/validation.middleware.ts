import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/app-error.js';

/**
 * Express middleware to validate request structures (body, query, params) against Zod schemas.
 * Replaces unvalidated request properties with parsed/coerced values.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errorDetails = result.error.errors.map((err) => ({
        field: err.path.slice(1).join('.'), // Remove top-level 'body'/'query'/'params'
        message: err.message,
      }));

      return next(new ValidationError('Request validation failed', errorDetails));
    }

    // Assign validated and coerced data back to request object
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
  };
}
