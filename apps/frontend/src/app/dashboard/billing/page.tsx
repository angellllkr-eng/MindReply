'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

export default function BillingDashboard() {
  const [usage, setUsage] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usageRes = await apiClient.get('/usage/dashboard');
        setUsage(usageRes.data.data);

        const invoicesRes = await apiClient.get('/billing/invoices');
        setInvoices(invoicesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Billing & Usage</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-lg p-6 mb-8 border-l-4 border-blue-600">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold capitalize mb-2">
              {usage?.tier} Plan
            </h2>
            <p className="text-gray-600">
              Renews on {new Date().toLocaleDateString()}
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Change Plan
          </button>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Briefs */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Briefs Used</h3>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${usage?.percentUsed?.briefs || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {usage?.usage?.briefs} of {usage?.limits?.briefs} used
          </p>
        </div>

        {/* Emails */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Emails Used</h3>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${usage?.percentUsed?.emails || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {usage?.usage?.emails} of {usage?.limits?.emails} used
          </p>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Storage Used</h3>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${usage?.percentUsed?.storage || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {usage?.usage?.storage_gb?.toFixed(2) || 0}GB of {usage?.limits?.storage_gb}GB used
          </p>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CreditCard size={24} />
          Billing History
        </h2>

        {invoices.length === 0 ? (
          <p className="text-gray-600">No invoices yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status === 'paid' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
