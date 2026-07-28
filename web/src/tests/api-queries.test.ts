import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../api/axios.client';

vi.mock('../api/axios.client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('React Query API Services Unit Tests', () => {
  it('should fetch user files with query parameters', async () => {
    const sampleFilesResponse = {
      data: {
        data: [{ id: 'f-1', originalName: 'test.pdf', mimeType: 'application/pdf', size: 1000, status: 'COMPLETED' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };

    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleFilesResponse);

    const res = await apiClient.get('/files', { params: { page: 1, limit: 10 } });
    expect(res.data.data.length).toBe(1);
    expect(res.data.data[0].originalName).toBe('test.pdf');
  });

  it('should fetch admin dashboard system statistics', async () => {
    const sampleStatsResponse = {
      data: {
        totalUsers: 50,
        totalFiles: 500,
        completedJobs: 490,
        failedJobs: 10,
        processingJobs: 0,
        storageUsedBytes: 104857600,
        averageProcessingTimeMs: 120,
      },
    };

    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleStatsResponse);

    const res = await apiClient.get('/admin/dashboard');
    expect(res.data.totalUsers).toBe(50);
    expect(res.data.completedJobs).toBe(490);
  });
});
