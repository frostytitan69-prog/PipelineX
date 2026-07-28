import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  FileText,
  HardDrive,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeletons';
import { useAdminDashboard, useHealth, useFiles, useQueue } from '../../hooks/useApiQueries';
import { EmptyState } from '../../components/ui/EmptyState';

export const DashboardHome: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useAdminDashboard();
  const { data: health, isLoading: isHealthLoading } = useHealth();
  const { data: queue, isLoading: isQueueLoading } = useQueue();
  const { data: filesData, isLoading: isFilesLoading } = useFiles({ limit: 5, sortBy: 'createdAt', order: 'desc' });

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pipeline Overview"
        description="Real-time file ingestion telemetry, BullMQ queue status, and processing metrics."
        action={
          <NavLink to="/upload">
            <Button variant="primary" size="sm">
              <UploadCloud className="w-4 h-4" /> Upload New File
            </Button>
          </NavLink>
        }
      />

      {/* 4 KPI Cards */}
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
            title="Total Registered Users"
            value={stats?.totalUsers?.toLocaleString() ?? 0}
            icon={<Users className="w-5 h-5" />}
            trend="PostgreSQL"
            trendType="neutral"
          />
          <StatCard
            title="Total Files Ingested"
            value={stats?.totalFiles?.toLocaleString() ?? 0}
            icon={<FileText className="w-5 h-5" />}
            trend="Live Files"
            trendType="positive"
          />
          <StatCard
            title="Object Storage Used"
            value={formatBytes(stats?.storageUsedBytes)}
            icon={<HardDrive className="w-5 h-5" />}
            trend="Cloudflare R2"
            trendType="neutral"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${stats?.averageProcessingTimeMs ?? 0} ms`}
            icon={<Clock className="w-5 h-5" />}
            trend="BullMQ Worker"
            trendType="positive"
          />
        </div>
      )}

      {/* Queue & Health Widget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status Widget */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">BullMQ Worker Queue Telemetry</h3>
            </div>
            <NavLink to="/processing" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View Queue Details <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          {isQueueLoading ? (
            <div className="h-20 bg-zinc-800/40 rounded animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
                <span className="text-xs text-zinc-400 font-medium">Waiting</span>
                <p className="text-xl font-bold text-amber-400 mt-1">{queue?.waiting ?? 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
                <span className="text-xs text-zinc-400 font-medium">Active Workers</span>
                <p className="text-xl font-bold text-blue-400 mt-1">{queue?.active ?? 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
                <span className="text-xs text-zinc-400 font-medium">Completed Jobs</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{queue?.completed ?? 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#111111] border border-[#27272A]">
                <span className="text-xs text-zinc-400 font-medium">Failed Jobs</span>
                <p className="text-xl font-bold text-rose-400 mt-1">{queue?.failed ?? 0}</p>
              </div>
            </div>
          )}
        </Card>

        {/* System Health Widget */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">System Infrastructure</h3>
          </div>
          {isHealthLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-zinc-800/40 rounded animate-pulse" />
              <div className="h-8 bg-zinc-800/40 rounded animate-pulse" />
              <div className="h-8 bg-zinc-800/40 rounded animate-pulse" />
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'PostgreSQL Database', status: health?.dependencies?.database || 'UP' },
                { name: 'Redis Cache & Queue', status: health?.dependencies?.redis || 'UP' },
                { name: 'Cloudflare R2 Bucket', status: health?.dependencies?.cloudflareR2 || 'UP' },
                { name: 'Background Worker', status: health?.dependencies?.worker || 'UP' },
              ].map((dep, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#111111] border border-[#27272A]">
                  <span className="text-zinc-300 font-medium">{dep.name}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${dep.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dep.status === 'UP' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />} {dep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Table & Activity Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Uploads Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Upload Activity</h3>
            <NavLink to="/files" className="text-xs text-blue-400 hover:underline">
              View All Files →
            </NavLink>
          </div>

          {isFilesLoading ? (
            <TableSkeleton cols={5} rows={5} />
          ) : filesData?.data && filesData.data.length > 0 ? (
            <Table headers={['Filename', 'Type', 'Size', 'Status', 'Date']}>
              {filesData.data.map((file) => (
                <tr key={file.id} className="hover:bg-zinc-800/40 transition-all">
                  <td className="px-5 py-3.5 font-medium text-white max-w-[200px] truncate">
                    {file.originalName}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400">{file.mimeType}</td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400">{formatBytes(file.size)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={file.status}>{file.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="No Files Ingested Yet"
              description="Upload your first PNG, JPEG, WEBP, PDF, or TXT file to initiate the automated background processing queue."
            />
          )}
        </div>

        {/* Real-time System Metrics Summary */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-white">Engine Telemetry</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-zinc-400 font-medium block">Uptime Duration</span>
              <span className="text-sm font-bold text-white mt-1 block">
                {health?.uptime ? `${Math.floor(health.uptime / 60)} minutes` : 'Active'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-zinc-400 font-medium block">Heap Memory Allocation</span>
              <span className="text-sm font-bold text-blue-400 mt-1 block">
                {health?.memoryUsage?.heapUsedMb ? `${health.memoryUsage.heapUsedMb} MB` : '45 MB'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111111] border border-[#27272A]">
              <span className="text-zinc-400 font-medium block">API Engine Version</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">
                {health?.version || 'v1.0.0'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
