import type { FileRecord, SystemStats, QueueStatus, User } from '../types';

export const mockCurrentUser: User = {
  id: 'usr_89234710',
  email: 'palraj@pipelinex.dev',
  role: 'ADMIN',
  createdAt: '2026-01-15T08:30:00.000Z',
};

export const mockStats: SystemStats = {
  totalUsers: 142,
  totalFiles: 1894,
  completedJobs: 1840,
  failedJobs: 12,
  processingJobs: 42,
  storageUsedBytes: 4831838208, // ~4.5 GB
  averageProcessingTimeMs: 245,
};

export const mockQueueStatus: QueueStatus = {
  waiting: 3,
  active: 2,
  completed: 1840,
  failed: 12,
  delayed: 0,
};

export const mockFiles: FileRecord[] = [
  {
    id: 'f-101',
    userId: 'usr_89234710',
    originalName: 'Q3_Financial_Analysis_Report.pdf',
    mimeType: 'application/pdf',
    size: 2457600,
    status: 'COMPLETED',
    createdAt: '2026-07-27T15:30:00.000Z',
  },
  {
    id: 'f-102',
    userId: 'usr_89234710',
    originalName: 'system_hero_mockup.png',
    mimeType: 'image/png',
    size: 1843200,
    status: 'PROCESSING',
    createdAt: '2026-07-27T15:45:00.000Z',
  },
  {
    id: 'f-103',
    userId: 'usr_89234710',
    originalName: 'application_logs_dump.txt',
    mimeType: 'text/plain',
    size: 512000,
    status: 'COMPLETED',
    createdAt: '2026-07-27T16:00:00.000Z',
  },
  {
    id: 'f-104',
    userId: 'usr_89234710',
    originalName: 'corrupt_binary_archive.exe',
    mimeType: 'application/x-msdownload',
    size: 819200,
    status: 'FAILED',
    createdAt: '2026-07-27T16:10:00.000Z',
  },
  {
    id: 'f-105',
    userId: 'usr_89234710',
    originalName: 'dashboard_redesign_v2.webp',
    mimeType: 'image/webp',
    size: 1228800,
    status: 'UPLOADED',
    createdAt: '2026-07-27T16:20:00.000Z',
  },
];

export const mockActivityFeed = [
  { id: 'act-1', message: 'Thumbnail generated for system_hero_mockup.png', timestamp: '2 mins ago', type: 'success' },
  { id: 'act-2', message: 'PDF text extracted (14 pages, 8,420 chars)', timestamp: '12 mins ago', type: 'info' },
  { id: 'act-3', message: 'Job retry initiated for corrupt_binary_archive.exe by Admin', timestamp: '25 mins ago', type: 'warning' },
  { id: 'act-4', message: 'Cloudflare R2 Object Storage backup completed', timestamp: '1 hour ago', type: 'success' },
];
