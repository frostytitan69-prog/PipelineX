import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { env } from '../../config/env.config';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const type = isAppError ? err.type : 'https://pipelinex.dev/errors/INTERNAL_ERROR';
  const title = isAppError ? err.name : 'Internal Server Error';

  const detail =
    env.NODE_ENV === 'production' && !isAppError
      ? 'An internal error occurred. Please contact support if the issue persists.'
      : err.message || 'An unexpected error occurred';

  logger.error(`[ERROR] ${req.method} ${req.originalUrl} (${statusCode}): ${err.message}`, {
    stack: err.stack,
    type,
    instance: req.originalUrl,
  });

  res.status(statusCode).json({
    type,
    title,
    status: statusCode,
    detail,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
