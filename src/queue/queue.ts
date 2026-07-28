import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.config';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';

const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const fileProcessingQueue = new Queue<FileProcessingJobPayload>(FILE_PROCESSING_QUEUE, {
  connection: redisConnection,
});
