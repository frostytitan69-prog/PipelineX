import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.service';
import { redis } from '../database/redis.service';

export class HealthController {
  public static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [dbResult, redisResult] = await Promise.allSettled([
        prisma.$queryRaw`SELECT 1`,
        redis.ping(),
      ]);

      const dbStatus = dbResult.status === 'fulfilled' ? 'UP' : 'DOWN';
      const redisStatus =
        redisResult.status === 'fulfilled' && redisResult.value === 'PONG' ? 'UP' : 'DOWN';

      const isHealthy = dbStatus === 'UP' && redisStatus === 'UP';
      const overallStatus = isHealthy ? 'OK' : 'DEGRADED';
      const httpCode = isHealthy ? 200 : 503;

      res.status(httpCode).json({
        status: overallStatus,
        service: 'PipelineX API',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbStatus,
          redis: redisStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
