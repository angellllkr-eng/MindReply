// Generation engine for the Mind-Reply agents.
//
// This ports the prompt/output contracts from apps/backend/src/services
// (briefService, seoService, distributionService, analysisService). It runs a
// deterministic local generator so the human-supervised workflow is fully
// demonstrable without external services. When an OPENAI_API_KEY (or AI
// Gateway) is configured, swap `generate*` internals for a model call that
// returns the same JSON shape — the rest of the pipeline is unchanged.

import type {
  BriefContent,
  Channel,
  ContentType,
  DistributionPlan,
  MessageAnalysis,
  SEOStrategy,
  Sentiment,
} from './types'

const LENGTH_GUIDE: Record<string, number> = {
  blog: 2000,
  video: 10,
  social: 280,
  whitepaper: 5000,
  case_study: 3000,
  infographic: 500,
  podcast: 30,
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function generateBrief(input: {
  topic: string
  targetAudience: string
  contentType: ContentType
  goals: string[]
  keywords: string[]
  agencyTone?: string
}): BriefContent {
  const tone = input.agencyTone || 'professional and engaging'
  const topic = input.topic.trim()
  const primaryGoal = input.goals[0] || 'drive qualified traffic'

  // Complex / niche topics get a slightly lower confidence so the escalation
  // rules in the review service can route them to a strategist.
  const complex = ['whitepaper', 'case_study'].includes(input.contentType)
  const confidenceScore = complex ? 0.72 : 0.86

  return {
    angle: `A practical, ${tone.split(' ')[0]} take on ${topic} that reframes it around outcomes ${input.targetAudience} actually care about.`,
    keyMessages: [
      `Why ${topic} matters right now for ${input.targetAudience}`,
      `The most common mistakes teams make with ${topic} — and how to avoid them`,
      `A repeatable framework readers can apply this week`,
    ],
    targetPain: `${titleCase(input.targetAudience)} struggle to turn ${topic} into measurable results without a clear, trustworthy playbook.`,
    solutionOffered: `This ${input.contentType} delivers a step-by-step approach to ${topic}, mapped directly to the goal of "${primaryGoal}".`,
    callToAction:
      input.contentType === 'social'
        ? 'Save this and share it with a teammate who owns this problem.'
        : `Book a call to see how this applies to your ${topic} strategy.`,
    estimatedLength: LENGTH_GUIDE[input.contentType] || 2000,
    tone,
    structureNotes: `Hook with the core pain → establish credibility → present the framework in ${complex ? '5-7' : '3-4'} sections → close with the CTA. Weave in keywords: ${input.keywords.join(', ') || topic}.`,
    confidenceScore,
  }
}

export function generateSEOStrategy(
  topic: string,
  primaryKeyword: string,
  _contentType: ContentType,
): SEOStrategy {
  const base = primaryKeyword || topic
  const meta = `${titleCase(base)}: A Practical Guide`
  return {
    primaryKeyword: base,
    secondaryKeywords: [
      `${base} strategy`,
      `${base} best practices`,
      `${base} examples`,
      `how to ${base}`,
    ],
    metaTitle: meta.slice(0, 60),
    metaDescription:
      `Learn ${base} the practical way. A clear framework, real examples, and the steps to get measurable results.`.slice(
        0,
        160,
      ),
    focusTopics: [`${titleCase(base)} fundamentals`, `${titleCase(base)} in practice`, `Measuring ${base}`],
    internalLinks: ['/blog/getting-started', '/resources/playbooks', '/case-studies'],
    externalLinks: ['https://hbr.org', 'https://www.gartner.com', 'https://moz.com'],
    relatedQueries: [
      `What is ${base}?`,
      `Is ${base} worth it?`,
      `${base} vs alternatives`,
      `Best tools for ${base}`,
    ],
  }
}

export function generateDistributionPlan(
  topic: string,
  targetAudience: string,
  contentType: ContentType,
): DistributionPlan {
  const channelLibrary: Record<string, Channel> = {
    LinkedIn: {
      name: 'LinkedIn',
      postingTime: 'Tuesday 9:00 AM',
      format: `Carousel summarizing the ${topic} framework with a strong opening line.`,
      estimatedReach: 5200,
      callToAction: 'Comment "guide" and we will send the full piece.',
    },
    'X (Twitter)': {
      name: 'X (Twitter)',
      postingTime: 'Wednesday 12:30 PM',
      format: `A 6-tweet thread breaking down the key messages on ${topic}.`,
      estimatedReach: 3100,
      callToAction: 'RT the first tweet to help others find it.',
    },
    Newsletter: {
      name: 'Newsletter',
      postingTime: 'Thursday 7:00 AM',
      format: `A short intro + link, framed around the ${targetAudience} pain point.`,
      estimatedReach: 2400,
      callToAction: 'Reply with your biggest question on the topic.',
    },
    YouTube: {
      name: 'YouTube',
      postingTime: 'Saturday 10:00 AM',
      format: `A talking-head walkthrough of the ${topic} framework with on-screen steps.`,
      estimatedReach: 4000,
      callToAction: 'Subscribe for the next deep dive.',
    },
  }

  const picks =
    contentType === 'video' || contentType === 'podcast'
      ? ['YouTube', 'LinkedIn', 'Newsletter']
      : ['LinkedIn', 'X (Twitter)', 'Newsletter']

  return {
    channels: picks.map((p) => channelLibrary[p]),
    crossPromotion: [
      'Repurpose the framework into a one-page PDF lead magnet',
      'Clip 2-3 short-form videos from the core sections',
      'Turn each key message into a standalone social post',
    ],
    timing: 'Publish mid-week mornings when the target audience is most active.',
    frequency: 'One pillar piece per week, with 3-4 derivative posts in between.',
    metrics: ['Engagement rate', 'Click-through rate', 'Qualified leads', 'Time on page'],
  }
}

export function buildCalendar(contentType: ContentType): {
  date: string
  contentType: string
  channel: string
  notes?: string
}[] {
  const entries: { date: string; contentType: string; channel: string; notes?: string }[] = []
  const today = new Date()
  const channels = ['LinkedIn', 'Newsletter', 'X (Twitter)', 'Social Media']
  for (let i = 0; i < 28; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      entries.push({
        date: date.toISOString(),
        contentType,
        channel: channels[i % channels.length],
        notes: i === 0 ? 'Publish pillar piece' : 'Derivative / promotion',
      })
    }
  }
  return entries
}

export function detectBriefEscalation(
  brief: BriefContent,
  contentType: ContentType,
): { shouldEscalate: boolean; reason?: string } {
  if (brief.confidenceScore < 0.75) {
    return { shouldEscalate: true, reason: `Low confidence score: ${brief.confidenceScore}` }
  }
  if (['whitepaper', 'case_study'].includes(contentType)) {
    return { shouldEscalate: true, reason: `Complex content type: ${contentType}` }
  }
  return { shouldEscalate: false }
}

// ---------- AgencyComm message analysis ----------

const NEGATIVE_HINTS = ['urgent', 'asap', 'disappointed', 'unhappy', 'refund', 'cancel', 'frustrat', 'late', 'wrong']
const POSITIVE_HINTS = ['thank', 'great', 'love', 'awesome', 'excited', 'happy', 'appreciate']

export function analyzeMessage(
  subject: string,
  body: string,
  agencyTone = 'professional and friendly',
): MessageAnalysis {
  const text = `${subject} ${body}`.toLowerCase()

  let sentiment: Sentiment = 'neutral'
  if (NEGATIVE_HINTS.some((h) => text.includes(h))) sentiment = 'negative'
  else if (POSITIVE_HINTS.some((h) => text.includes(h))) sentiment = 'positive'

  const questions = body
    .split(/(?<=[?])\s+/)
    .filter((s) => s.trim().endsWith('?'))
    .map((s) => s.trim())
    .slice(0, 5)

  const firstName = subject ? '' : ''
  const greeting = sentiment === 'negative' ? 'Thanks for flagging this' : 'Thanks for reaching out'

  const suggestedReply = [
    `Hi there,`,
    ``,
    `${greeting} — I appreciate you taking the time to write in about "${subject}".`,
    questions.length
      ? `To your question${questions.length > 1 ? 's' : ''}: here's where things stand and what we'll do next.`
      : `Here's a quick update and the next steps on our side.`,
    ``,
    `Please let me know if this works for you and I'll get it moving right away.`,
    ``,
    `Best,`,
    `The team`,
  ].join('\n')

  const confidenceScore = sentiment === 'negative' ? 0.68 : questions.length > 2 ? 0.74 : 0.88

  return {
    summary: `${sentiment === 'negative' ? 'A concerned' : sentiment === 'positive' ? 'A positive' : 'A neutral'} message about "${subject}". ${
      questions.length ? `${questions.length} question(s) raised.` : 'No explicit questions.'
    } Tone target for reply: ${agencyTone}.`,
    sentiment,
    extractedQuestions: questions,
    suggestedReply,
    confidenceScore,
  }
}

export function detectMessageEscalation(
  sentiment: Sentiment,
  confidenceScore: number,
  questionCount: number,
): { shouldEscalate: boolean; reason?: string } {
  if (confidenceScore < 0.75) {
    return { shouldEscalate: true, reason: `Low confidence (${confidenceScore})` }
  }
  if (sentiment === 'negative') {
    return { shouldEscalate: true, reason: 'Negative sentiment detected' }
  }
  if (questionCount >= 4) {
    return { shouldEscalate: true, reason: 'Multiple open questions' }
  }
  return { shouldEscalate: false }
}
