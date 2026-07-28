import React, { useState } from 'react';
import { Download, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFiles, useDeleteFile } from '../../hooks/useApiQueries';
import { apiClient } from '../../api/axios.client';

export const MyFilesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState<'createdAt' | 'size'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data, isLoading } = useFiles({
    page,
    limit,
    sortBy,
    order,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  });

  const deleteMutation = useDeleteFile();

  const handleDelete = async () => {
    if (deleteTargetId) {
      try {
        await deleteMutation.mutateAsync(deleteTargetId);
        toast.success('File deleted from Cloudflare R2 and database.');
      } catch (err: unknown) {
        toast.error('Failed to delete file.');
      } finally {
        setDeleteTargetId(null);
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const { data: resData } = await apiClient.get<{ downloadUrl: string }>(`/files/${fileId}/download`);
      if (resData?.downloadUrl) {
        window.open(resData.downloadUrl, '_blank');
        toast.success(`Generated presigned download link for "${filename}".`);
      }
    } catch {
      toast.error('Failed to generate presigned download URL.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Files"
        description="View and manage all uploaded files, inspect metadata, download source objects, or purge resources."
      />

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search files by original filename..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-[#18181B] border border-[#27272A] rounded-lg text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Sort:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-') as ['createdAt' | 'size', 'asc' | 'desc'];
                setSortBy(sb);
                setOrder(ord);
              }}
              className="px-2.5 py-1.5 text-xs bg-[#18181B] border border-[#27272A] rounded-lg text-zinc-200 focus:outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="size-desc">Largest Size</option>
              <option value="size-asc">Smallest Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton cols={6} rows={6} />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <Table headers={['Filename', 'MIME Type', 'Size', 'Status', 'Date', 'Actions']}>
            {data.data.map((file) => (
              <tr key={file.id} className="hover:bg-zinc-800/40 transition-all">
                <td className="px-5 py-3.5 font-medium text-white max-w-[240px] truncate">
                  {file.originalName}
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">{file.mimeType}</td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={file.status}>{file.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(file.id, file.originalName)}
                      title="Download Presigned Link"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(file.id)}
                      title="Delete File"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          {/* Pagination Controls */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-zinc-400">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total files)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] disabled:opacity-50 hover:bg-zinc-800 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] disabled:opacity-50 hover:bg-zinc-800 transition-all flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={search ? 'No Matching Search Results' : 'No Files Found'}
          description={
            search
              ? `No files matched your search query "${search}".`
              : 'Upload a file to initiate automated processing.'
          }
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete File Permanently?"
        message="This action will permanently purge the object from Cloudflare R2 storage and erase its database metadata. This cannot be undone."
        confirmText="Delete File"
        isDanger
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
