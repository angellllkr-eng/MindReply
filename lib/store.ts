// In-memory data store for the Mind-Reply ecosystem.
//
// This is the single persistence layer behind every route handler. It is
// seeded with realistic demo data so the human-supervised workflow is fully
// explorable. To move to production, replace the bodies of these functions
// with a real database (Neon/Postgres) — the function signatures match the
// documented REST contract, so route handlers and the UI stay unchanged.

import {
  analyzeMessage,
  buildCalendar,
  detectMessageEscalation,
  generateBrief,
  generateDistributionPlan,
  generateSEOStrategy,
} from './generation'
import type {
  Agency,
  BriefProject,
  ContentType,
  FollowUp,
  IncomingMessage,
  Invoice,
  Subscription,
  Tier,
  UsageEvent,
  User,
} from './types'

interface DB {
  user: User
  agency: Agency
  briefs: BriefProject[]
  messages: IncomingMessage[]
  followUps: FollowUp[]
  subscription: Subscription
  usageEvents: UsageEvent[]
  invoices: Invoice[]
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursFromNow(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() + n)
  return d.toISOString()
}

function seed(): DB {
  const user: User = {
    id: 'usr_demo',
    email: 'strategist@mind-reply.com',
    name: 'Alex Rivera',
    agencyId: 'agc_demo',
    role: 'admin',
  }

  const agency: Agency = {
    id: 'agc_demo',
    name: 'Northstar Creative',
    settings: { tonePreference: 'professional and friendly', escalationEmail: 'lead@mind-reply.com' },
  }

  // --- Seed a couple of fully-generated briefs in different states ---
  const briefs: BriefProject[] = []

  const seedBrief = (
    title: string,
    topic: string,
    audience: string,
    contentType: ContentType,
    goals: string[],
    keywords: string[],
    status: BriefProject['status'],
    createdDaysAgo: number,
  ): BriefProject => {
    const brief = generateBrief({ topic, targetAudience: audience, contentType, goals, keywords })
    const seo = generateSEOStrategy(topic, keywords[0] || topic, contentType)
    const dist = generateDistributionPlan(topic, audience, contentType)
    const now = daysAgo(createdDaysAgo)
    return {
      id: id('brf'),
      userId: user.id,
      title,
      topic,
      targetAudience: audience,
      contentType,
      goals,
      keywords,
      status,
      brief,
      seoStrategy: seo,
      distribution: dist,
      calendar: buildCalendar(contentType),
      reviewedBy: status === 'approved' || status === 'delivered' ? user.id : null,
      reviewerName: status === 'approved' || status === 'delivered' ? user.name : null,
      reviewedAt: status === 'approved' || status === 'delivered' ? daysAgo(createdDaysAgo - 1) : null,
      deliveredAt: status === 'delivered' ? daysAgo(createdDaysAgo - 1) : null,
      views: status === 'delivered' ? 42 : 0,
      downloads: status === 'delivered' ? 7 : 0,
      shares: status === 'delivered' ? 3 : 0,
      createdAt: now,
      updatedAt: now,
    }
  }

  briefs.push(
    seedBrief(
      'Q1 SaaS Onboarding Playbook',
      'user onboarding',
      'B2B SaaS product managers',
      'blog',
      ['Generate qualified leads', 'Establish thought leadership'],
      ['user onboarding', 'activation rate', 'product-led growth'],
      'review',
      1,
    ),
    seedBrief(
      'The State of AI in Creative Agencies',
      'AI in creative agencies',
      'Agency owners and creative directors',
      'whitepaper',
      ['Drive demo bookings'],
      ['AI for agencies', 'creative automation'],
      'review',
      2,
    ),
    seedBrief(
      'LinkedIn Growth in 30 Days',
      'LinkedIn personal branding',
      'Founders and solo consultants',
      'social',
      ['Build brand awareness'],
      ['LinkedIn growth', 'personal branding'],
      'approved',
      4,
    ),
    seedBrief(
      'How We Cut Response Time by 60%',
      'customer response time',
      'Support and operations leads',
      'case_study',
      ['Drive demo bookings', 'Build trust'],
      ['response time', 'customer support automation'],
      'delivered',
      9,
    ),
  )

  // A draft brief that has not been generated yet
  briefs.push({
    id: id('brf'),
    userId: user.id,
    title: 'Holiday Campaign Strategy',
    topic: 'holiday marketing campaigns',
    targetAudience: 'E-commerce marketing managers',
    contentType: 'blog',
    goals: ['Drive seasonal sales'],
    keywords: ['holiday marketing', 'seasonal campaigns'],
    status: 'draft',
    brief: null,
    seoStrategy: null,
    distribution: null,
    calendar: null,
    views: 0,
    downloads: 0,
    shares: 0,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  })

  // --- Seed AgencyComm inbox messages, each analyzed + queued for approval ---
  const rawMessages: {
    from: string
    fromName: string
    subject: string
    body: string
    receivedDaysAgo: number
    status: IncomingMessage['status']
  }[] = [
    {
      from: 'sarah@brightlabs.io',
      fromName: 'Sarah Chen',
      subject: 'Timeline for the new landing page',
      body: 'Hi team, can you share an updated timeline for the landing page? When can we expect the first draft? Also, is the copywriting included in this phase?',
      receivedDaysAgo: 0,
      status: 'processed',
    },
    {
      from: 'mike@acmeco.com',
      fromName: 'Mike Donovan',
      subject: 'Disappointed with the latest revisions',
      body: 'I have to say I am quite disappointed with the latest revisions. This is the third round and it still does not match the brief. We need this fixed urgently before the launch.',
      receivedDaysAgo: 0,
      status: 'processed',
    },
    {
      from: 'jen@growthhouse.co',
      fromName: 'Jen Alvarez',
      subject: 'Thank you — amazing work!',
      body: 'Just wanted to say thank you, the campaign assets look great and the team loved them. Excited for the next phase!',
      receivedDaysAgo: 1,
      status: 'replied',
    },
    {
      from: 'partners@vendorx.com',
      fromName: 'VendorX Partnerships',
      subject: 'Quick question about invoicing',
      body: 'Could you confirm which entity we should invoice? And do you need a PO number before we proceed?',
      receivedDaysAgo: 2,
      status: 'processed',
    },
  ]

  const messages: IncomingMessage[] = rawMessages.map((m) => {
    const analysis = analyzeMessage(m.subject, m.body, agency.settings.tonePreference)
    const esc = detectMessageEscalation(
      analysis.sentiment,
      analysis.confidenceScore,
      analysis.extractedQuestions.length,
    )
    return {
      id: id('msg'),
      agencyId: agency.id,
      from: m.from,
      fromName: m.fromName,
      subject: m.subject,
      bodyText: m.body,
      receivedAt: daysAgo(m.receivedDaysAgo),
      status: m.status,
      analysis,
      approval: {
        id: id('apr'),
        status: m.status === 'replied' ? 'approved' : esc.shouldEscalate ? 'escalated' : 'pending',
        suggestedReply: analysis.suggestedReply,
        humanEdits: null,
        escalationReason: esc.shouldEscalate ? esc.reason : null,
        reviewedBy: m.status === 'replied' ? user.id : null,
        reviewedAt: m.status === 'replied' ? daysAgo(m.receivedDaysAgo) : null,
      },
      createdAt: daysAgo(m.receivedDaysAgo),
    }
  })

  // --- Follow-ups ---
  const followUps: FollowUp[] = [
    {
      id: id('fup'),
      agencyId: agency.id,
      messageId: messages[2].id,
      subject: 'Re: Thank you — amazing work!',
      contact: 'Jen Alvarez',
      type: 'nudge',
      scheduledAt: hoursFromNow(48),
      status: 'pending',
      notes: 'Check in about next phase scope.',
    },
    {
      id: id('fup'),
      agencyId: agency.id,
      messageId: messages[3].id,
      subject: 'Re: Quick question about invoicing',
      contact: 'VendorX Partnerships',
      type: 'reminder',
      scheduledAt: hoursFromNow(24),
      status: 'pending',
      notes: 'Confirm PO number received.',
    },
    {
      id: id('fup'),
      agencyId: agency.id,
      messageId: messages[0].id,
      subject: 'Re: Timeline for the new landing page',
      contact: 'Sarah Chen',
      type: 'reminder',
      scheduledAt: daysAgo(1),
      status: 'completed',
      completedAt: daysAgo(1),
      notes: 'Sent updated timeline.',
    },
  ]

  const subscription: Subscription = {
    userId: user.id,
    tier: 'pro',
    status: 'active',
    currentPeriodEnd: hoursFromNow(24 * 21),
  }

  // Usage events for the current month
  const usageEvents: UsageEvent[] = [
    { userId: user.id, eventType: 'brief_created', quantity: 4, timestamp: daysAgo(5) },
    { userId: user.id, eventType: 'email_sent', quantity: 23, timestamp: daysAgo(3) },
    { userId: user.id, eventType: 'pdf_generated', quantity: 6, timestamp: daysAgo(2) },
  ]

  const invoices: Invoice[] = [
    { id: 'in_1029', amount: 29, currency: 'USD', date: daysAgo(2), status: 'paid', pdfUrl: '#' },
    { id: 'in_1003', amount: 29, currency: 'USD', date: daysAgo(33), status: 'paid', pdfUrl: '#' },
    { id: 'in_0981', amount: 29, currency: 'USD', date: daysAgo(63), status: 'paid', pdfUrl: '#' },
  ]

  return { user, agency, briefs, messages, followUps, subscription, usageEvents, invoices }
}

// Persist a single instance across hot reloads / requests in dev.
const g = globalThis as unknown as { __mindReplyDB?: DB }
export const db: DB = g.__mindReplyDB ?? (g.__mindReplyDB = seed())

// Helpers ------------------------------------------------------------------

export function currentUser(): User {
  return db.user
}

export { id as newId }
