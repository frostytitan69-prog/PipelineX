export type Role = 'USER' | 'ADMIN';
export type FileStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: FileStatus;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalFiles: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  storageUsedBytes: number;
  averageProcessingTimeMs: number;
}

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}
