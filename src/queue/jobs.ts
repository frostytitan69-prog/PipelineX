export const FILE_PROCESSING_QUEUE = 'FileProcessingQueue';

export interface FileProcessingJobPayload {
  fileId: string;
  userId: string;
  storageKey: string;
  mimeType: string;
  uploadedAt: string;
}
