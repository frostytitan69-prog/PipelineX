import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: isDev ? 30 : 5, // 30 requests/min in dev, 5/min in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (req: Request, res: Response) => {
    logger.warn(`[RATE LIMIT VIOLATION] Auth rate limit exceeded by IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      type: 'https://pipelinex.dev/errors/TOO_MANY_REQUESTS',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Authentication rate limit exceeded. Please try again in 1 minute.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'anonymous',
  handler: (req: Request, res: Response) => {
    logger.warn(`[RATE LIMIT VIOLATION] Upload rate limit exceeded by User: ${req.user?.userId || req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      type: 'https://pipelinex.dev/errors/TOO_MANY_REQUESTS',
      title: 'Too Many Requests',
      status: 429,
      detail: 'File upload rate limit exceeded. Please try again in 1 minute.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  },
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 200 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (req: Request, res: Response) => {
    logger.warn(`[RATE LIMIT VIOLATION] Admin rate limit exceeded by IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      type: 'https://pipelinex.dev/errors/TOO_MANY_REQUESTS',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Admin API rate limit exceeded. Please try again in 1 minute.',
      instance: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  },
});
