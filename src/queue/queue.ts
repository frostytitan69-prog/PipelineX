import { Queue } from 'bullmq';
import { env } from '../config/env.config';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';

const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

export const fileProcessingQueue = new Queue<FileProcessingJobPayload>(FILE_PROCESSING_QUEUE, {
  connection: redisConnectionOptions,
});
