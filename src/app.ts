import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './common/middleware/error-handler.middleware';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { AppError } from './common/errors/app-error';

export const createApp = (): Application => {
  const app: Application = express();

  // Core Security & Utilities Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);

  // API Routes
  app.use('/api/v1', healthRoutes);

  // 404 Not Found Fallback Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        `Route ${req.method} ${req.originalUrl} not found`,
        404,
        'https://pipelinex.dev/errors/NOT_FOUND'
      )
    );
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
