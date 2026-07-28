import { Request, Response, NextFunction } from 'express';
import { redis } from '../database/redis.service';
import { logger } from '../common/utils/logger.util';

export class CacheService {
  private static TTL = 300; // 5 minutes in seconds

  public static generateUserKey(userId: string, prefix: string, suffix = ''): string {
    return `cache:${prefix}:${userId}${suffix ? `:${suffix}` : ''}`;
  }

  public static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (data) {
        logger.info(`⚡ [CACHE HIT] Key: ${key}`);
        return JSON.parse(data) as T;
      }
      logger.info(`🔍 [CACHE MISS] Key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`❌ [CACHE ERROR] Failed to fetch key ${key}:`, error);
      return null;
    }
  }

  public static async set(key: string, data: unknown, ttl = CacheService.TTL): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      logger.error(`❌ [CACHE ERROR] Failed to set key ${key}:`, error);
    }
  }

  public static async invalidateUserCache(userId: string): Promise<void> {
    try {
      const pattern = `cache:*:${userId}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`🧹 [CACHE INVALIDATED] Purged ${keys.length} cache keys for User: ${userId}`);
      }
    } catch (error) {
      logger.error(`❌ [CACHE ERROR] Failed to invalidate cache for User ${userId}:`, error);
    }
  }

  public static cacheMiddleware = (prefix: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (process.env.NODE_ENV === 'test' || !req.user) {
        return next();
      }

      const userId = req.user.userId;
      const queryStr = Object.keys(req.query).length ? JSON.stringify(req.query) : '';
      const paramId = req.params.id ? req.params.id : '';
      const cacheKey = CacheService.generateUserKey(userId, prefix, `${paramId}:${queryStr}`);

      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        res.status(200).json(cachedData);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown): Response => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(cacheKey, body).catch((err) => {
            logger.error(`❌ Failed to background cache key ${cacheKey}:`, err);
          });
        }
        return originalJson(body);
      };

      next();
    };
  };
}
