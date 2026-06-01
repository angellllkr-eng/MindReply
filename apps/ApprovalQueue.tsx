'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QueueItem {
  id: string;
  message: {
    subject: string;
    from: string;
    createdAt: string;
  };
  analysis: {
    summary: string;
    sentiment: string;
    suggestedReplyDraft: string;
  };
}

export function ApprovalQueue({ items }: { items: QueueItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.post(`/queue/${id}/approve`, {
        humanEdits: editedReply || undefined,
      });
      alert('✅ Approved and queued for sending');
      setSelectedId(null);
      setEditedReply('');
    } catch (err) {
      alert('❌ Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.post(`/queue/${id}/reject`, {
        reason: 'Rejected by reviewer',
      });
      alert('❌ Rejected');
      setSelectedId(null);
    } catch (err) {
      alert('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.post(`/queue/${id}/escalate`, {
        reason: 'Needs expert review',
      });
      alert('⚠️ Escalated for expert review');
      setSelectedId(null);
    } catch (err) {
      alert('Failed to escalate');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <p className="text-gray-500">No pending approvals</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => setSelectedId(item.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.message.subject}</h3>
              <p className="text-sm text-gray-600">From: {item.message.from}</p>
              <p className="text-sm text-gray-700 mt-2">{item.analysis.summary}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  item.analysis.sentiment === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.analysis.sentiment}
                </span>
              </div>
            </div>
          </div>

          {selectedId === item.id && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Suggested Reply:</h4>
                <textarea
                  value={editedReply || item.analysis.suggestedReplyDraft}
                  onChange={(e) => setEditedReply(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button
                  onClick={() => handleEscalate(item.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  <AlertCircle size={18} /> Escalate
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}