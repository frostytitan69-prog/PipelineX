import React, { useState } from 'react';
import { UploadCloud, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/axios.client';

export interface UploadResponse {
  message: string;
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    status: string;
    storageKey: string;
  };
  jobId: string;
}

export const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadedJob, setLastUploadedJob] = useState<UploadResponse | null>(null);
  const queryClient = useQueryClient();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRealUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadProgress(40);
      const { data } = await apiClient.post<UploadResponse>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setLastUploadedJob(data);
      toast.success(`File "${data.file.originalName}" uploaded! BullMQ Job ${data.jobId} enqueued.`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Upload failed. Ensure file size is under 20MB and format is supported.';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="File Ingestion Pipeline"
        description="Upload images (PNG, JPEG, WEBP) or documents (PDF, TXT) up to 20MB for asynchronous processing."
      />

      <Card>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-xl p-12 text-center transition-all bg-[#111111]/50 cursor-pointer"
        >
          <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mx-auto mb-4">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Drag and drop your file here</h3>
          <p className="text-xs text-zinc-400 mb-6">Or click to browse from your computer</p>

          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
          />
          <label htmlFor="fileInput">
            <Button variant="secondary" size="sm" type="button">
              Browse File
            </Button>
          </label>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Badge variant="default">PNG</Badge>
            <Badge variant="default">JPG / JPEG</Badge>
            <Badge variant="default">WEBP</Badge>
            <Badge variant="default">PDF</Badge>
            <Badge variant="default">TXT</Badge>
            <span className="text-xs text-zinc-500 self-center ml-2">Max limit: 20MB</span>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 rounded-xl bg-[#111111] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-zinc-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRealUpload}
                isLoading={isUploading}
                disabled={Boolean(lastUploadedJob)}
              >
                {lastUploadedJob ? 'Job Queued ✅' : 'Start Pipeline Ingestion'}
              </Button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Uploading to Cloudflare R2...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {lastUploadedJob && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold">File uploaded & stored in R2!</p>
              <p className="text-emerald-300/80 text-[11px] font-mono mt-0.5">
                BullMQ Job ID: {lastUploadedJob.jobId} | File ID: {lastUploadedJob.file.id}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setLastUploadedJob(null);
              }}
            >
              Upload Another
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
