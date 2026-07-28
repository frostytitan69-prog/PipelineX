import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_WORKER: z.string().optional().default('true').transform((val) => val !== 'false' && val !== '0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  R2_ACCESS_KEY_ID: z.string().default('mock-access-key-id'),
  R2_SECRET_ACCESS_KEY: z.string().default('mock-secret-access-key'),
  R2_BUCKET_NAME: z.string().default('pipelinex-uploads'),
  R2_ENDPOINT: z.string().default('http://localhost:4566'),
  R2_REGION: z.string().default('auto'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
