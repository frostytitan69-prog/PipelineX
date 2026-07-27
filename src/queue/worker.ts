import { Worker } from 'bullmq';
import { env } from '../config/env.config';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';
import { processFileJob } from './processor';

const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

export const fileWorker = new Worker<FileProcessingJobPayload>(
  FILE_PROCESSING_QUEUE,
  processFileJob,
  {
    connection: redisConnectionOptions,
    concurrency: 5,
  }
);

fileWorker.on('completed', (job) => {
  console.log(`🎉 [WORKER EVENT] Job ${job.id} marked COMPLETED`);
});

fileWorker.on('failed', (job, err) => {
  console.error(`💥 [WORKER EVENT] Job ${job?.id} failed with error:`, err.message);
});
