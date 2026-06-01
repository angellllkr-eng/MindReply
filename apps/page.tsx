'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { MetricsCard } from '@/components/MetricsCard';
import { ApprovalQueue } from '@/components/ApprovalQueue';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, queueRes] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/queue'),
        ]);
        setMetrics(metricsRes.data);
        setQueue(queueRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard
          label="Messages Handled"
          value={metrics?.messagesProcessed || 0}
          trend="+12%"
        />
        <MetricsCard
          label="Replies Approved"
          value={metrics?.repliesApproved || 0}
          trend="+8%"
        />
        <MetricsCard
          label="Follow-ups Sent"
          value={metrics?.followUpsSent || 0}
          trend="+15%"
        />
        <MetricsCard
          label="Hours Saved"
          value={`${(metrics?.estimatedHoursSaved || 0).toFixed(1)}h`}
          trend="+22%"
        />
      </div>

      {/* Approval Queue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
        <ApprovalQueue items={queue} />
      </div>
    </div>
  );
}