import { Queue } from 'bullmq';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';
import { getRedisOptions } from '../database/redis.service';

export const fileProcessingQueue = new Queue<FileProcessingJobPayload>(FILE_PROCESSING_QUEUE, {
  connection: getRedisOptions(),
});
