import React from 'react';
import { Cpu, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeletons';
import { useQueue, useFiles } from '../hooks/useApiQueries';

export const ProcessingPage: React.FC = () => {
  const { data: queue } = useQueue();
  const { data: filesData, isLoading } = useFiles({ limit: 10, sortBy: 'createdAt', order: 'desc' });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Processing Queue Monitor"
        description="Inspect background worker execution states, pipeline job progress, and active handlers."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Active Worker Jobs</span>
            <p className="text-xl font-bold text-white">{queue?.active ?? 0} Active</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Completed Total</span>
            <p className="text-xl font-bold text-white">{queue?.completed ?? 0} Processed</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium">Waiting in Queue</span>
            <p className="text-xl font-bold text-white">{queue?.waiting ?? 0} Waiting</p>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : filesData?.data && filesData.data.length > 0 ? (
        <Table headers={['File ID', 'Filename', 'Handler Engine', 'Status', 'Timestamp']}>
          {filesData.data.map((file) => (
            <tr key={file.id} className="hover:bg-zinc-800/40 transition-all">
              <td className="px-5 py-3.5 font-mono text-xs text-blue-400">{file.id}</td>
              <td className="px-5 py-3.5 text-xs text-white font-medium">{file.originalName}</td>
              <td className="px-5 py-3.5 text-xs text-zinc-400">
                {file.mimeType.startsWith('image')
                  ? 'Sharp (300x300 JPEG)'
                  : file.mimeType === 'application/pdf'
                  ? 'pdf-parse Text Extract'
                  : 'UTF-8 Text Stats'}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={file.status}>{file.status}</Badge>
              </td>
              <td className="px-5 py-3.5 text-xs text-zinc-500">{new Date(file.createdAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <p className="text-xs text-zinc-400 p-4 border border-zinc-800 rounded-lg">No processing records found.</p>
      )}
    </div>
  );
};
