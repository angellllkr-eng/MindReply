'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface BriefItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  brief?: any;
  seoStrategy?: any;
}

export default function ContentFlowDashboard() {
  const [briefs, setBriefs] = useState<BriefItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const res = await apiClient.get('/briefs');
        setBriefs(res.data.data);
      } catch (err) {
        console.error('Failed to fetch briefs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'review':
        return <Clock className="text-blue-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      case 'draft':
        return <AlertCircle className="text-gray-600" size={20} />;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">ContentFlow Dashboard</h1>
          <p className="text-gray-600">Manage your content briefs</p>
        </div>
        <a
          href="/contentflow/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          + New Brief
        </a>
      </div>

      {briefs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No briefs yet</p>
          <a
            href="/contentflow/create"
            className="text-blue-600 hover:underline font-semibold"
          >
            Create your first brief
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {briefs.map((brief) => (
            <div key={brief.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(brief.status)}
                    <h3 className="text-xl font-semibold">{brief.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created {new Date(brief.createdAt).toLocaleDateString()}
                  </p>
                  {brief.status === 'review' && (
                    <p className="text-sm text-blue-600 mt-2">⏳ Awaiting strategist review</p>
                  )}
                  {brief.status === 'approved' && (
                    <p className="text-sm text-green-600 mt-2">✓ Ready to download</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/contentflow/view/${brief.id}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    View
                  </a>
                  {brief.status === 'approved' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
