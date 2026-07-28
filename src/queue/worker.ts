import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.config';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';
import { processFileJob } from './processor';

export function startFileWorker() {
  const redisConnection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker<FileProcessingJobPayload>(
    FILE_PROCESSING_QUEUE,
    processFileJob,
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 Job ${job?.id} failed:`, err);
  });

  console.log('✅ BullMQ Worker started');

  return worker;
}