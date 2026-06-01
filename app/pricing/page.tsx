'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Check, X } from 'lucide-react';

interface Tier {
  name: string;
  price: number;
  interval: string;
  limits: Record<string, number>;
  features: string[];
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<Record<string, Tier>>({});
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get pricing tiers
        const pricingRes = await apiClient.get('/billing/pricing');
        setTiers(pricingRes.data.data);

        // Get current subscription
        const subRes = await apiClient.get('/billing/subscription');
        setCurrentTier(subRes.data.data.tier);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (tier: string) => {
    if (tier === currentTier) {
      alert('You are already on this plan');
      return;
    }

    try {
      const res = await apiClient.post('/billing/subscribe', { tier });
      router.push('/dashboard');
    } catch (err) {
      alert('❌ Subscription failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your agency
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(tiers).map(([key, tier]) => (
            <div
              key={key}
              className={`rounded-lg p-6 transition ${
                currentTier === key
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                  : 'bg-white text-gray-900 hover:shadow-lg'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

              {/* Price */}
              <div className="mb-6">
                {tier.price === 0 ? (
                  <>
                    <span className="text-3xl font-bold">Free</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      ${(tier.price / 100).toFixed(0)}
                    </span>
                    <span className={currentTier === key ? '' : 'text-gray-600'}>
                      /{tier.interval}
                    </span>
                  </>
                )}
              </div>

              {/* Limits */}
              <div className="mb-6 text-sm">
                <div className="mb-2">
                  <strong>{tier.limits.briefs}</strong> briefs/month
                </div>
                <div className="mb-2">
                  <strong>{tier.limits.emails}</strong> emails/month
                </div>
                <div>
                  <strong>{tier.limits.storage_gb}GB</strong> storage
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-2">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(key)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  currentTier === key
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentTier === key ? '✓ Current Plan' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Agency</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">Briefs per month</td>
                  <td className="text-center">1</td>
                  <td className="text-center">10</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Email management</td>
                  <td className="text-center">10</td>
                  <td className="text-center">100</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Team collaboration</td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">White-label</td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4">API access</td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><X size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                  <td className="text-center"><Check size={16} className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
