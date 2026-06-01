// Shared domain types for the Mind-Reply ecosystem.
// These mirror the Prisma models documented in ARCHITECTURE.md and
// apps/contentflow/README.md so the runtime API stays faithful to the spec.

export type BriefStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'delivered'
export type ContentType =
  | 'blog'
  | 'video'
  | 'social'
  | 'whitepaper'
  | 'case_study'
  | 'infographic'
  | 'podcast'

export type Tier = 'free' | 'pro' | 'agency' | 'enterprise'

export interface User {
  id: string
  email: string
  name: string
  agencyId: string
  role: 'admin' | 'team_member'
}

export interface Agency {
  id: string
  name: string
  settings: { tonePreference: string; escalationEmail?: string }
}

// ---------- ContentFlow ----------

export interface BriefContent {
  angle: string
  keyMessages: string[]
  targetPain: string
  solutionOffered: string
  callToAction: string
  estimatedLength: number
  tone: string
  structureNotes: string
  confidenceScore: number
}

export interface SEOStrategy {
  primaryKeyword: string
  secondaryKeywords: string[]
  metaTitle: string
  metaDescription: string
  focusTopics: string[]
  internalLinks: string[]
  externalLinks: string[]
  relatedQueries: string[]
}

export interface Channel {
  name: string
  postingTime: string
  format: string
  estimatedReach: number
  callToAction: string
}

export interface DistributionPlan {
  channels: Channel[]
  crossPromotion: string[]
  timing: string
  frequency: string
  metrics: string[]
}

export interface CalendarEntry {
  date: string
  contentType: string
  channel: string
  notes?: string
}

export interface BriefProject {
  id: string
  userId: string
  title: string
  topic: string
  targetAudience: string
  contentType: ContentType
  goals: string[]
  keywords: string[]
  status: BriefStatus
  brief: BriefContent | null
  seoStrategy: SEOStrategy | null
  distribution: DistributionPlan | null
  calendar: CalendarEntry[] | null
  escalationReason?: string | null
  reviewedBy?: string | null
  reviewerName?: string | null
  reviewedAt?: string | null
  reviewFeedback?: string | null
  deliveredAt?: string | null
  views: number
  downloads: number
  shares: number
  createdAt: string
  updatedAt: string
}

// ---------- AgencyComm ----------

export type MessageStatus = 'new' | 'processed' | 'replied' | 'archived'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated'
export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface MessageAnalysis {
  summary: string
  sentiment: Sentiment
  extractedQuestions: string[]
  suggestedReply: string
  confidenceScore: number
}

export interface ApprovalItem {
  id: string
  status: ApprovalStatus
  suggestedReply: string
  humanEdits: string | null
  escalationReason?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export interface IncomingMessage {
  id: string
  agencyId: string
  from: string
  fromName: string
  subject: string
  bodyText: string
  receivedAt: string
  status: MessageStatus
  analysis: MessageAnalysis | null
  approval: ApprovalItem | null
  createdAt: string
}

export type FollowUpType = 'reminder' | 'nudge' | 'escalation'
export type FollowUpStatus = 'pending' | 'completed' | 'cancelled'

export interface FollowUp {
  id: string
  agencyId: string
  messageId: string
  subject: string
  contact: string
  type: FollowUpType
  scheduledAt: string
  status: FollowUpStatus
  notes?: string
  completedAt?: string | null
}

// ---------- Billing & usage ----------

export interface Subscription {
  userId: string
  tier: Tier
  status: 'active' | 'cancelled'
  currentPeriodEnd: string
}

export interface UsageEvent {
  userId: string
  eventType: 'brief_created' | 'email_sent' | 'pdf_generated'
  quantity: number
  timestamp: string
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  date: string
  status: 'paid' | 'open'
  pdfUrl: string
}
