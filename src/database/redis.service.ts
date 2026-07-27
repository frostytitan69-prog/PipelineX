import Redis from 'ioredis';
import { env } from '../config/env.config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const createRedisInstance = (): Redis => {
  const client = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: false,
    enableOfflineQueue: true,
  });

  client.on('connect', () => {
    console.log('⚡ Redis connected successfully');
  });

  client.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
  });

  return client;
};

export const redis = globalForRedis.redis ?? createRedisInstance();

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export const disconnectRedis = async (): Promise<void> => {
  if (redis.status !== 'end') {
    await redis.quit();
    console.log('🔌 Redis client disconnected');
  }
};
