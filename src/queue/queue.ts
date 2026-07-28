import { Queue } from 'bullmq';
import { FILE_PROCESSING_QUEUE, FileProcessingJobPayload } from './jobs';
import { getBullMQConnection } from '../database/redis.service';

export const fileProcessingQueue = new Queue<FileProcessingJobPayload>(FILE_PROCESSING_QUEUE, {
  connection: getBullMQConnection(),
});
