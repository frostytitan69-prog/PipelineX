import Redis from 'ioredis';
import { env } from '../config/env.config';

const globalForRedis = globalThis as {
  redis?: Redis;
};

const createRedisInstance = () => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  });

  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  client.on('error', (err) => {
    console.error('❌ Redis Error:', err);
  });

  return client;
};

export const redis =
  globalForRedis.redis ?? createRedisInstance();

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export const disconnectRedis = async (): Promise<void> => {
  if (redis.status !== 'end') {
    await redis.quit();
    console.log('🔌 Redis client disconnected');
  }
};
