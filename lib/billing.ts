// Pricing tiers and usage limits, ported from
// apps/backend/src/services/billingService.ts and usageService.ts.

import type { Tier } from './types'

export interface TierLimits {
  briefs: number
  emails: number
  storage_gb: number
}

export const PRICING_TIERS: Record<
  Tier,
  {
    name: string
    price: number // cents
    interval: string
    limits: TierLimits
    features: string[]
  }
> = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    limits: { briefs: 1, emails: 10, storage_gb: 1 },
    features: [
      'Basic brief generation',
      '1 brief per month',
      'Email management (10/mo)',
      'Basic analytics',
    ],
  },
  pro: {
    name: 'Pro',
    price: 2900,
    interval: 'month',
    limits: { briefs: 10, emails: 100, storage_gb: 10 },
    features: [
      'AI brief + SEO strategy',
      '10 briefs per month',
      'Email management (100/mo)',
      'Advanced analytics',
      'Custom templates',
      'Priority support',
    ],
  },
  agency: {
    name: 'Agency',
    price: 19900,
    interval: 'month',
    limits: { briefs: 999, emails: 999, storage_gb: 100 },
    features: [
      'Unlimited briefs',
      'Unlimited emails',
      'Team collaboration',
      'White-label option',
      'API access',
      'Dedicated support',
      'Advanced automation',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 0,
    interval: 'month',
    limits: { briefs: 999, emails: 999, storage_gb: 1000 },
    features: [
      'Everything in Agency',
      'Dedicated strategist',
      'Custom integrations',
      'SLA guarantee',
      'Priority feature requests',
      '24/7 phone support',
    ],
  },
}

export function getTierLimits(tier: Tier): TierLimits {
  return PRICING_TIERS[tier]?.limits ?? PRICING_TIERS.free.limits
}
