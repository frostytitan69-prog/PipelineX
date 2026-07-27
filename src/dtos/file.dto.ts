import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'text/plain',
] as const;

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.txt'] as const;

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB in bytes

export const fileIdParamSchema = z.object({
  id: z.string().uuid('Invalid file ID format'),
});

export interface FileUploadResponseDto {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  jobId: string;
  uploadedAt: Date;
}

export interface FileStatusResponseDto {
  fileId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface FileMetadataDto {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  fileHash: string | null;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export interface DownloadUrlResponseDto {
  fileId: string;
  downloadUrl: string;
  expiresInSeconds: number;
}
