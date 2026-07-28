import Redis from 'ioredis';
import { env } from '../config/env.config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const getRedisOptions = () => {
  const isUpstash = env.REDIS_HOST.includes('.upstash.io');
  const useTls = env.REDIS_TLS || isUpstash;

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    tls: useTls ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: null,
  };
};

const createRedisInstance = (): Redis => {
  const isTest = env.NODE_ENV === 'test';
  const options = getRedisOptions();

  const client = new Redis({
    ...options,
    lazyConnect: false,
    enableOfflineQueue: !isTest,
    connectTimeout: isTest ? 1000 : 10000,
    retryStrategy: isTest ? () => null : (times) => Math.min(times * 100, 3000),
  });

  client.on('connect', () => {
    console.log('⚡ Redis connected successfully');
  });

  client.on('error', (err) => {
    if (env.NODE_ENV !== 'test') {
      console.error('❌ Redis Connection Error:', err.message || err);
    }
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
