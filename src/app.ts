import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes';
import adminRoutes from './routes/admin.routes';
import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './common/middleware/error-handler.middleware';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { AppError } from './common/errors/app-error';

export const createApp = (): Application => {
  const app: Application = express();

  // Core Security & Compression Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
    })
  );

  app.use(cors());
  app.use(compression({ threshold: 1024 })); // Compress responses > 1KB
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);

  // Swagger Documentation UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check routes
  app.use('/api/v1', healthRoutes);
  app.use('/api', healthRoutes);
  app.use('/', healthRoutes);

  // API Domain Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/files', fileRoutes);
  app.use('/api/v1/admin', adminRoutes);

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
