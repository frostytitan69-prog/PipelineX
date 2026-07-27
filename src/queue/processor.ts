import { Job } from 'bullmq';
import { prisma } from '../database/prisma.service';
import { FileProcessingJobPayload } from './jobs';

export const processFileJob = async (job: Job<FileProcessingJobPayload>): Promise<void> => {
  const startTime = Date.now();
  const { fileId, storageKey } = job.data;

  console.log(`🚀 [WORKER] Job started | Job ID: ${job.id} | File ID: ${fileId} | Key: ${storageKey}`);

  try {
    // Transition status to PROCESSING
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'PROCESSING' },
    });

    // Simulate heavy background processing (3 seconds delay)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Transition status to COMPLETED
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'COMPLETED' },
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [WORKER] Job completed | Job ID: ${job.id} | File ID: ${fileId} | Duration: ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [WORKER] Job failed | Job ID: ${job.id} | File ID: ${fileId} | Duration: ${duration}ms`, error);

    // If max retries reached or unrecoverable error, mark as FAILED
    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      await prisma.file.update({
        where: { id: fileId },
        data: { status: 'FAILED' },
      });
    }

    throw error; // Rethrow to allow BullMQ to handle retry backoff
  }
};
