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

export const fileQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100, 'Maximum limit is 100').default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'size']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  mimeType: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  toDate: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
});

export type FileQueryParams = z.infer<typeof fileQuerySchema>;

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

export interface ProcessingResultResponseDto {
  fileId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingTimeMs: number | null;
  metadata: Record<string, unknown> | null;
  pageCount: number | null;
  thumbnailUrl: string | null;
  textContent: string | null;
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
