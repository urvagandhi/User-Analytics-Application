import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { logger } from '../utils/logger.js';

/**
 * Global Express error handling middleware.
 * Formats errors into a unified JSON structure and logs events appropriately.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn({
      msg: 'Application error',
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
      requestId,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Log unhandled server errors with stack traces for debugging
  logger.error({
    msg: 'Unhandled internal error',
    error: err.message,
    stack: err.stack,
    requestId,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
