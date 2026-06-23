import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Middleware to log structured JSON request and response metadata.
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, url, ip } = req;
  const requestId = req.requestId;

  logger.info({
    msg: 'Incoming request',
    method,
    url,
    ip,
    requestId,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    logger.info({
      msg: 'Request processed',
      method,
      url,
      statusCode,
      durationMs: duration,
      requestId,
    });
  });

  next();
}
