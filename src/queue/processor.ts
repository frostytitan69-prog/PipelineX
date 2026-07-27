import { Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.service';
import { storageService } from '../services/storage.service';
import { FileProcessingJobPayload } from './jobs';
import { ImageHandler } from '../handlers/image.handler';
import { PdfHandler } from '../handlers/pdf.handler';
import { TxtHandler } from '../handlers/txt.handler';

export const processFileJob = async (job: Job<FileProcessingJobPayload>): Promise<void> => {
  const startTime = Date.now();
  const { fileId, userId, storageKey, mimeType } = job.data;

  console.log(`🚀 [WORKER] Job started | Job ID: ${job.id} | File ID: ${fileId} | Key: ${storageKey}`);

  // Check if file still exists in PostgreSQL database before processing
  const existingFile = await prisma.file.findUnique({ where: { id: fileId } });
  if (!existingFile) {
    console.warn(`⚠️ [WORKER] File record ${fileId} no longer exists in database. Aborting job ${job.id}.`);
    return;
  }

  try {
    // 1. Transition File status to PROCESSING
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'PROCESSING' },
    });

    // 2. Fetch source file buffer from storage
    const fileBuffer = await storageService.getFileBuffer(storageKey);

    let thumbnailStorageKey: string | null = null;
    let metadata: Record<string, unknown> = {};
    let pageCount: number | null = null;
    let textContent: string | null = null;

    // 3. Detect MIME type and execute corresponding pipeline handler
    if (mimeType.startsWith('image/')) {
      const result = await ImageHandler.process(userId, fileBuffer);
      thumbnailStorageKey = result.thumbnailStorageKey;
      metadata = result.metadata;
    } else if (mimeType === 'application/pdf') {
      const result = await PdfHandler.process(fileBuffer);
      pageCount = result.pageCount;
      metadata = result.metadata;
      textContent = result.textContent;
    } else if (mimeType === 'text/plain') {
      const result = await TxtHandler.process(fileBuffer);
      metadata = result.metadata;
      textContent = result.textContent;
    } else {
      throw new Error(`Unsupported MIME type '${mimeType}' for processing`);
    }

    const processingTimeMs = Date.now() - startTime;
    const jsonMetadata = metadata as Prisma.InputJsonValue;

    // 4. Save ProcessingResult in PostgreSQL database
    await prisma.processingResult.upsert({
      where: { fileId },
      update: {
        processingTimeMs,
        thumbnailStorageKey,
        metadata: jsonMetadata,
        pageCount,
        textContent,
      },
      create: {
        fileId,
        processingTimeMs,
        thumbnailStorageKey,
        metadata: jsonMetadata,
        pageCount,
        textContent,
      },
    });

    // 5. Update File status to COMPLETED
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'COMPLETED' },
    });

    console.log(`✅ [WORKER] Processing completed | Job ID: ${job.id} | File ID: ${fileId} | Duration: ${processingTimeMs}ms`);
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`❌ [WORKER] Processing failed | Job ID: ${job.id} | File ID: ${fileId} | Duration: ${duration}ms`, error);

    // If max retries reached or unrecoverable error, mark File as FAILED (if file still exists)
    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      try {
        await prisma.file.update({
          where: { id: fileId },
          data: { status: 'FAILED' },
        });
      } catch (_updateErr) {
        // File record was deleted from database
      }
    }

    throw error;
  }
};
