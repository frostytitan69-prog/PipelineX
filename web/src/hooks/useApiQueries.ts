import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios.client';
import type { FileRecord, SystemStats, QueueStatus, User } from '../types';

export interface FileQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'size';
  order?: 'asc' | 'desc';
  status?: string;
  mimeType?: string;
  search?: string;
}

export interface FilesResponse {
  data: FileRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: {
    database: string;
    redis: string;
    worker: string;
    cloudflareR2: string;
  };
  queue: QueueStatus;
  memoryUsage: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
}

// 1. Current User Query
export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

// 2. Files List Query with Pagination, Sorting & Filtering
export const useFiles = (params: FileQueryParams = {}) => {
  return useQuery<FilesResponse>({
    queryKey: ['files', params],
    queryFn: async () => {
      const { data } = await apiClient.get<FilesResponse>('/files', { params });
      return data;
    },
    staleTime: 1000 * 30,
  });
};

// 3. Admin Dashboard Statistics Query
export const useAdminDashboard = () => {
  return useQuery<SystemStats>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<SystemStats>('/admin/dashboard');
      return data;
    },
    refetchInterval: 10000,
  });
};

// 4. BullMQ Queue Telemetry Query
export const useQueue = () => {
  return useQuery<QueueStatus>({
    queryKey: ['queueStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get<QueueStatus>('/admin/queue');
      return data;
    },
    refetchInterval: 5000,
  });
};

// 5. System Health & Infrastructure Query
export const useHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await apiClient.get<HealthResponse>('/health');
      return data;
    },
    refetchInterval: 15000,
  });
};

// 6. Job Retry Mutation
export const useRetryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.post(`/admin/jobs/${jobId}/retry`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

// 7. File Delete Mutation
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const { data } = await apiClient.delete(`/files/${fileId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
};
