import { Worker } from 'bullmq';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';
import { processFileJob } from './processor';
import { getRedisOptions } from '../database/redis.service';

export const fileWorker = new Worker<FileProcessingJobPayload>(
  FILE_PROCESSING_QUEUE,
  processFileJob,
  {
    connection: getRedisOptions(),
    concurrency: 5,
  }
);

fileWorker.on('completed', (job) => {
  console.log(`🎉 [WORKER EVENT] Job ${job.id} marked COMPLETED`);
});

fileWorker.on('failed', (job, err) => {
  console.error(`💥 [WORKER EVENT] Job ${job?.id} failed with error:`, err.message);
});
