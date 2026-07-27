import { FileStatus } from '@prisma/client';
import { prisma } from '../database/prisma.service';
import { fileProcessingQueue } from '../queue/queue';
import { queueService } from './queue.service';
import { AdminDashboardStatsDto, AdminQueueStatsDto, AdminJobDetailsDto } from '../dtos/admin.dto';
import { AppError } from '../common/errors/app-error';

export class AdminService {
  public async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    const [
      totalUsers,
      totalFiles,
      completedJobs,
      failedJobs,
      processingJobs,
      storageAggregate,
      avgTimeAggregate,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.file.count({ where: { status: 'COMPLETED' } }),
      prisma.file.count({ where: { status: 'FAILED' } }),
      prisma.file.count({ where: { status: 'PROCESSING' } }),
      prisma.file.aggregate({ _sum: { size: true } }),
      prisma.processingResult.aggregate({ _avg: { processingTimeMs: true } }),
    ]);

    return {
      totalUsers,
      totalFiles,
      totalJobs: totalFiles,
      completedJobs,
      failedJobs,
      processingJobs,
      storageUsedBytes: storageAggregate._sum.size || 0,
      averageProcessingTimeMs: Math.round(avgTimeAggregate._avg.processingTimeMs || 0),
    };
  }

  public async getQueueStats(): Promise<AdminQueueStatsDto> {
    const counts = await fileProcessingQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed'
    );

    return {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
    };
  }

  public async getJobs(status?: string, page = 1, limit = 10): Promise<{ jobs: AdminJobDetailsDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const whereCondition = status ? { status: status as FileStatus } : {};

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: whereCondition,
        include: { processingResult: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: whereCondition }),
    ]);

    const jobs: AdminJobDetailsDto[] = files.map((file) => ({
      fileId: file.id,
      jobId: file.id,
      userId: file.userId,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      attemptsMade: 1,
      errorDetails: null,
      processingTimeMs: file.processingResult?.processingTimeMs ?? null,
      createdAt: file.createdAt,
    }));

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getJobById(jobId: string): Promise<AdminJobDetailsDto> {
    const file = await prisma.file.findUnique({
      where: { id: jobId },
      include: { processingResult: true },
    });

    if (!file) {
      throw new AppError('Job / File not found', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
    }

    const bullJob = await fileProcessingQueue.getJob(jobId);

    return {
      fileId: file.id,
      jobId: file.id,
      userId: file.userId,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      attemptsMade: bullJob?.attemptsMade || 1,
      errorDetails: bullJob?.failedReason || null,
      processingTimeMs: file.processingResult?.processingTimeMs ?? null,
      createdAt: file.createdAt,
    };
  }

  public async retryJob(jobId: string): Promise<{ message: string; jobId: string }> {
    const file = await prisma.file.findUnique({
      where: { id: jobId },
    });

    if (!file) {
      throw new AppError('Job / File not found', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
    }

    // Reset status to UPLOADED
    await prisma.file.update({
      where: { id: file.id },
      data: { status: 'UPLOADED' },
    });

    // Re-enqueue job in BullMQ
    const newJobId = await queueService.addFileProcessingJob({
      fileId: file.id,
      userId: file.userId,
      storageKey: file.storageKey,
      mimeType: file.mimeType,
      uploadedAt: file.createdAt.toISOString(),
    });

    return {
      message: `Job ${jobId} re-queued successfully for processing`,
      jobId: newJobId,
    };
  }
}

export const adminService = new AdminService();
