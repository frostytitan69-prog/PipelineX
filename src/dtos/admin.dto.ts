export interface AdminDashboardStatsDto {
  totalUsers: number;
  totalFiles: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  storageUsedBytes: number;
  averageProcessingTimeMs: number;
}

export interface AdminQueueStatsDto {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface AdminJobDetailsDto {
  fileId: string;
  jobId: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  attemptsMade: number;
  errorDetails: string | null;
  processingTimeMs: number | null;
  createdAt: Date;
}
