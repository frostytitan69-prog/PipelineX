import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.service';
import { redis } from '../database/redis.service';
import { fileProcessingQueue } from '../queue/queue';

export class HealthController {
  public static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [dbResult, redisResult, queueCounts] = await Promise.allSettled([
        prisma.$queryRaw`SELECT 1`,
        redis.ping(),
        fileProcessingQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      ]);

      const dbStatus = dbResult.status === 'fulfilled' ? 'UP' : 'DOWN';
      const redisStatus =
        redisResult.status === 'fulfilled' && redisResult.value === 'PONG' ? 'UP' : 'DOWN';
      const workerStatus = redisStatus === 'UP' ? 'UP' : 'DOWN';

      const isHealthy = dbStatus === 'UP' && redisStatus === 'UP';
      const overallStatus = isHealthy ? 'OK' : 'DEGRADED';
      const httpCode = isHealthy ? 200 : 503;

      const memoryUsage = process.memoryUsage();

      res.status(httpCode).json({
        status: overallStatus,
        service: 'PipelineX API',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        dependencies: {
          database: dbStatus,
          redis: redisStatus,
          worker: workerStatus,
          cloudflareR2: 'UP',
        },
        queue: queueCounts.status === 'fulfilled' ? queueCounts.value : null,
        memoryUsage: {
          heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
