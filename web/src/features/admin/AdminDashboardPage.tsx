import React, { useState } from 'react';
import {
  Shield,
  Users,
  HardDrive,
  Cpu,
  RotateCcw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeletons';
import { useAdminDashboard, useQueue, useFiles, useRetryJob } from '../../hooks/useApiQueries';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboard();
  const { data: queue, isLoading: isQueueLoading } = useQueue();
  const { data: filesData, isLoading: isFilesLoading } = useFiles({ limit: 10, sortBy: 'createdAt', order: 'desc' });
  const retryMutation = useRetryJob();
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      await retryMutation.mutateAsync(jobId);
      toast.success(`Job ${jobId} re-queued into BullMQ successfully!`);
    } catch (err: unknown) {
      toast.error(`Failed to retry job ${jobId}.`);
    } finally {
      setRetryingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="System-wide observability, BullMQ queue telemetry, job inspection, and manual execution retries."
        action={
          <Badge variant="ADMIN" className="py-1 px-3 text-xs">
            <Shield className="w-3.5 h-3.5 mr-1" /> ADMIN ACCESS ONLY
          </Badge>
        }
      />

      {/* KPI Cards */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Platform Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Total Uploaded Files"
            value={stats?.totalFiles ?? 0}
            icon={<HardDrive className="w-5 h-5" />}
          />
          <StatCard
            title="Completed Jobs"
            value={stats?.completedJobs ?? 0}
            icon={<CheckCircle className="w-5 h-5" />}
            trendType="positive"
          />
          <StatCard
            title="Failed Jobs"
            value={stats?.failedJobs ?? 0}
            icon={<XCircle className="w-5 h-5" />}
            trendType="negative"
          />
        </div>
      )}

      {/* Queue Breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">Live BullMQ Redis Telemetry</h3>
        </div>
        {isQueueLoading ? (
          <div className="h-20 bg-zinc-800/40 rounded animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-xs text-zinc-400">Waiting</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{queue?.waiting ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-xs text-zinc-400">Active</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{queue?.active ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-xs text-zinc-400">Completed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{queue?.completed ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-xs text-zinc-400">Failed</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{queue?.failed ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-xs text-zinc-400">Delayed</span>
              <p className="text-2xl font-bold text-zinc-400 mt-1">{queue?.delayed ?? 0}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Job Management Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Job Inspection & Manual Retry Queue</h3>
        {isFilesLoading ? (
          <TableSkeleton cols={5} rows={5} />
        ) : filesData?.data && filesData.data.length > 0 ? (
          <Table headers={['File ID / Name', 'MIME Type', 'Status', 'Size', 'Action']}>
            {filesData.data.map((file) => (
              <tr key={file.id} className="hover:bg-zinc-800/40 transition-all">
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs text-blue-400 block">{file.id}</span>
                  <span className="text-xs text-zinc-300 font-medium max-w-[200px] truncate block">
                    {file.originalName}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">{file.mimeType}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={file.status}>{file.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-5 py-3.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetryJob(file.id)}
                    isLoading={retryingJobId === file.id}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Job
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-xs text-zinc-400 p-4 border border-zinc-800 rounded-lg">No job records found.</p>
        )}
      </div>
    </div>
  );
};
