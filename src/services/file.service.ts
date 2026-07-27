import crypto from 'crypto';
import { prisma } from '../database/prisma.service';
import { storageService } from './storage.service';
import { queueService } from './queue.service';
import {
  FileUploadResponseDto,
  FileStatusResponseDto,
  ProcessingResultResponseDto,
  FileMetadataDto,
  DownloadUrlResponseDto,
} from '../dtos/file.dto';
import { AppError } from '../common/errors/app-error';

export class FileService {
  private computeFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  public async uploadFile(userId: string, file: Express.Multer.File): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new AppError('File payload missing from request', 400, 'https://pipelinex.dev/errors/VALIDATION_ERROR');
    }

    const fileHash = this.computeFileHash(file.buffer);
    const storageKey = storageService.generateStorageKey(userId, file.originalname);

    // 1. Upload to Cloudflare R2 / S3 storage bucket
    await storageService.uploadFile(storageKey, file.buffer, file.mimetype);

    // 2. Save record in PostgreSQL database via Prisma with status = UPLOADED
    const dbFile = await prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey,
        fileHash,
        status: 'UPLOADED',
      },
    });

    // 3. Enqueue background job to BullMQ
    let jobId = dbFile.id;
    try {
      jobId = await queueService.addFileProcessingJob({
        fileId: dbFile.id,
        userId: dbFile.userId,
        storageKey: dbFile.storageKey,
        mimeType: dbFile.mimeType,
        uploadedAt: dbFile.createdAt.toISOString(),
      });
    } catch (queueErr) {
      console.error('❌ Failed to push job to BullMQ queue:', queueErr);
      throw new AppError('Failed to enqueue background processing job', 500, 'https://pipelinex.dev/errors/QUEUE_ERROR');
    }

    // 4. Return immediate response
    return {
      fileId: dbFile.id,
      originalName: dbFile.originalName,
      mimeType: dbFile.mimeType,
      size: dbFile.size,
      status: dbFile.status,
      jobId,
      uploadedAt: dbFile.createdAt,
    };
  }

  public async getFileStatus(userId: string, fileId: string): Promise<FileStatusResponseDto> {
    const file = await this.getFileMetadata(userId, fileId);
    return {
      fileId: file.id,
      status: file.status,
    };
  }

  public async getFileResult(userId: string, fileId: string): Promise<ProcessingResultResponseDto> {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
      include: { processingResult: true },
    });

    if (!file) {
      throw new AppError('File not found or access denied', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
    }

    let thumbnailUrl: string | null = null;
    if (file.processingResult?.thumbnailStorageKey) {
      thumbnailUrl = await storageService.getSignedDownloadUrl(file.processingResult.thumbnailStorageKey, 900);
    }

    return {
      fileId: file.id,
      status: file.status,
      processingTimeMs: file.processingResult?.processingTimeMs ?? null,
      metadata: (file.processingResult?.metadata as Record<string, unknown>) ?? null,
      pageCount: file.processingResult?.pageCount ?? null,
      thumbnailUrl,
      textContent: file.processingResult?.textContent ?? null,
    };
  }

  public async getUserFiles(userId: string): Promise<FileMetadataDto[]> {
    return prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getFileMetadata(userId: string, fileId: string): Promise<FileMetadataDto> {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new AppError('File not found or access denied', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
    }

    return file;
  }

  public async getDownloadUrl(userId: string, fileId: string): Promise<DownloadUrlResponseDto> {
    const file = await this.getFileMetadata(userId, fileId);
    const expiresInSeconds = 900; // 15 minutes link validity

    const downloadUrl = await storageService.getSignedDownloadUrl(file.storageKey, expiresInSeconds);

    return {
      fileId: file.id,
      downloadUrl,
      expiresInSeconds,
    };
  }

  public async deleteFile(userId: string, fileId: string): Promise<void> {
    const file = await this.getFileMetadata(userId, fileId);

    // Delete object from Cloudflare R2 / S3 storage
    await storageService.deleteFile(file.storageKey);

    // Delete metadata record from PostgreSQL database
    await prisma.file.delete({
      where: { id: file.id },
    });
  }
}

export const fileService = new FileService();
