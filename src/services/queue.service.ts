import { fileProcessingQueue } from '../queue/queue';
import { FileProcessingJobPayload } from '../queue/jobs';

export class QueueService {
  public async addFileProcessingJob(payload: FileProcessingJobPayload): Promise<string> {
    const job = await fileProcessingQueue.add('process-file', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    console.log(`📌 [QUEUE] Job queued | Job ID: ${job.id} | File ID: ${payload.fileId}`);
    return job.id || payload.fileId;
  }
}

export const queueService = new QueueService();
