import React from 'react';
import { BarChart3, TrendingUp, Zap, HardDrive } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Analytics"
        description="Performance benchmarking, processing throughput, and object storage consumption charts."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Throughput Rate"
          value="42 files/min"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+15% peak"
        />
        <StatCard
          title="Average Latency"
          value="245 ms"
          icon={<Zap className="w-5 h-5" />}
          trend="-10ms"
          trendType="positive"
        />
        <StatCard
          title="Storage Consumption"
          value="4.5 GB"
          icon={<HardDrive className="w-5 h-5" />}
          trend="Cloudflare R2"
          trendType="neutral"
        />
      </div>

      <Card className="p-8 text-center border-dashed border-zinc-800">
        <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Interactive Analytics Visualization</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Chart visualizations for daily throughput, MIME type breakdown, and sub-millisecond execution breakdowns are configured for telemetry tracking.
        </p>
      </Card>
    </div>
  );
};
