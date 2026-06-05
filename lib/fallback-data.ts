export type ProfessionalDto = {
  id: number;
  name: string;
  role: string;
  niche: string;
  bio: string;
  rating: number;
  reviewCount: number;
  priceText: number;
  priceVoice: number;
  priceVideo: number;
  availabilityStatus: "available" | "busy" | "fully_booked";
  languages: string[];
  photoUrl: string;
  specializations: string[] | null;
  yearsExperience: number | null;
};

export type MembershipDto = {
  id: number;
  tier: "curator" | "strategist" | "sovereign";
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
};

export type LexiconDto = {
  id: number;
  name: string;
  category: string;
  description: string;
  terms: string[];
};

export type BookingDto = {
  id: number;
  professionalId: number;
  professionalName: string;
  mode: "text" | "voice" | "video";
  scheduledAt: string;
  durationMinutes: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  clientName: string;
  clientEmail: string;
  notes: string | null;
};

export const fallbackProfessionals: ProfessionalDto[] = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    role: "Child Psychologist",
    niche: "CBT, trauma-informed support, school stress, and family communication.",
    bio: "Dr. Jenkins helps families translate complex emotional pressure into clear next steps. Her sessions combine clinical discipline with calm, practical language for parents, teachers, and young people.",
    rating: 4.9,
    reviewCount: 124,
    priceText: 70,
    priceVoice: 110,
    priceVideo: 150,
    availabilityStatus: "available",
    languages: ["English", "Bulgarian"],
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    specializations: ["CBT", "School stress", "Emotional regulation"],
    yearsExperience: 12,
  },
  {
    id: 2,
    name: "Mark Thompson",
    role: "Executive Coach",
    niche: "Leadership communication, strategic presence, and high-stakes decisions.",
    bio: "Mark works with founders and senior operators who need concise, composed language under pressure. His advisory style is direct, measured, and execution-focused.",
    rating: 4.8,
    reviewCount: 89,
    priceText: 85,
    priceVoice: 140,
    priceVideo: 200,
    availabilityStatus: "available",
    languages: ["English", "German"],
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    specializations: ["Leadership", "Negotiation", "Decision clarity"],
    yearsExperience: 16,
  },
  {
    id: 3,
    name: "Isabelle Moreau",
    role: "Relationship & Communication Coach",
    niche: "Conflict de-escalation, boundaries, and emotionally intelligent dialogue.",
    bio: "Isabelle helps clients shift charged conversations into clear, respectful exchanges. She is especially strong in partnership, team, and client-facing tension.",
    rating: 4.9,
    reviewCount: 142,
    priceText: 80,
    priceVoice: 125,
    priceVideo: 180,
    availabilityStatus: "busy",
    languages: ["English", "French", "Spanish"],
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    specializations: ["Conflict", "Boundaries", "Relationship communication"],
    yearsExperience: 14,
  },
  {
    id: 4,
    name: "James Hartley",
    role: "Legal Advisor",
    niche: "Employment, contracts, and corporate risk communication.",
    bio: "James gives practical legal orientation for founders and teams who need to understand risk before a formal engagement. His communication style is precise and commercially aware.",
    rating: 4.7,
    reviewCount: 76,
    priceText: 110,
    priceVoice: 180,
    priceVideo: 240,
    availabilityStatus: "available",
    languages: ["English"],
    photoUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop",
    specializations: ["Contracts", "Employment", "Compliance"],
    yearsExperience: 20,
  },
  {
    id: 5,
    name: "Elena Petrova",
    role: "Financial Advisor",
    niche: "Runway planning, personal finance structure, and founder cash clarity.",
    bio: "Elena brings calm structure to money decisions. She helps clients map tradeoffs, reduce avoidable risk, and communicate financial choices with confidence.",
    rating: 4.6,
    reviewCount: 67,
    priceText: 95,
    priceVoice: 150,
    priceVideo: 210,
    availabilityStatus: "available",
    languages: ["English", "Bulgarian", "Italian"],
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    specializations: ["Runway", "Personal finance", "Allocation basics"],
    yearsExperience: 11,
  },
  {
    id: 6,
    name: "Priya Raman",
    role: "Business Consultant",
    niche: "Positioning, offers, operations, and behavioral communication strategy.",
    bio: "Priya helps companies turn noisy demand into a more deliberate operating model. Her work connects message clarity, offer design, and execution cadence.",
    rating: 4.9,
    reviewCount: 103,
    priceText: 120,
    priceVoice: 190,
    priceVideo: 260,
    availabilityStatus: "available",
    languages: ["English", "Hindi"],
    photoUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop",
    specializations: ["Positioning", "Operations", "Growth strategy"],
    yearsExperience: 15,
  },
  {
    id: 7,
    name: "Amelia Brooks",
    role: "HR Leader & Executive PA",
    niche: "Talent communication, executive coordination, sensitive internal messaging, and leadership cadence.",
    bio: "Amelia supports founders, chiefs of staff, and people leaders who need composed internal communication under pressure. Her work turns sensitive updates, talent decisions, and leadership requests into clear language that protects trust and momentum.",
    rating: 4.8,
    reviewCount: 94,
    priceText: 90,
    priceVoice: 145,
    priceVideo: 205,
    availabilityStatus: "available",
    languages: ["English", "French"],
    photoUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=400&fit=crop",
    specializations: ["Talent communication", "Executive coordination", "Internal messaging"],
    yearsExperience: 13,
  },
];

export const fallbackMemberships: MembershipDto[] = [
  {
    id: 1,
    tier: "curator",
    name: "Curator",
    price: 49,
    description: "For emerging professionals refining their communicative presence.",
    features: ["5 professional lexicons", "3 micro-tools", "Monthly insights report", "50 credits monthly"],
    highlighted: false,
  },
  {
    id: 2,
    tier: "strategist",
    name: "Strategist",
    price: 149,
    description: "For established professionals leading teams and client relationships.",
    features: ["All 20+ lexicons", "Full micro-tool suite", "Advanced analytics", "Unlimited credits"],
    highlighted: true,
  },
  {
    id: 3,
    tier: "sovereign",
    name: "Sovereign",
    price: 499,
    description: "For executive leadership and organizational transformation.",
    features: ["Dedicated architect", "Organization-wide customization", "Predictive modeling", "Board-level reporting"],
    highlighted: false,
  },
];

export const fallbackLexicons: LexiconDto[] = [
  {
    id: 1,
    name: "Clinical Psychologist Lexicon",
    category: "Psychology",
    description: "Therapeutic language for care, boundaries, and clinical collaboration.",
    terms: ["I notice you are describing", "Would you be willing to explore", "Let us prioritize immediate safety"],
  },
  {
    id: 2,
    name: "Legal Counsel Lexicon",
    category: "Legal",
    description: "Precise, risk-aware language for counsel, contracts, and compliance.",
    terms: ["Subject to review", "Material consideration", "Commercially reasonable position"],
  },
  {
    id: 3,
    name: "Executive Operations Lexicon",
    category: "Leadership",
    description: "Clear operating language for priorities, delegation, and follow-through.",
    terms: ["Decision owner", "Next irreversible step", "Signal-to-noise ratio"],
  },
  {
    id: 4,
    name: "Financial Advisor Lexicon",
    category: "Finance",
    description: "Calibrated language for tradeoffs, risk, runway, and allocation.",
    terms: ["Risk-adjusted", "Liquidity runway", "Scenario-weighted decision"],
  },
];

export const fallbackBookings: BookingDto[] = [];

export function fallbackSlots() {
  const days = [1, 2, 3, 4, 5].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  });

  return days.flatMap((date, dayIndex) =>
    ["09:00", "11:00", "14:00", "16:00"].map((time, slotIndex) => ({
      date,
      time,
      available: (dayIndex + slotIndex) % 3 !== 0,
    })),
  );
}

export function analyticsFromFallback() {
  const totalProfessionals = fallbackProfessionals.length;
  const availableProfessionals = fallbackProfessionals.filter((p) => p.availabilityStatus === "available").length;
  const avgRating = fallbackProfessionals.reduce((sum, p) => sum + p.rating, 0) / totalProfessionals;
  const roleCounts = fallbackProfessionals.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalProfessionals,
    availableProfessionals,
    totalBookings: fallbackBookings.length,
    activeMembers: 1240,
    avgRating: Math.round(avgRating * 10) / 10,
    toolRuns: 18,
    agentMessages: 9,
    orchestrationRuns: 2,
    backgroundLoops: 2,
    recentMetrics: [
      { id: 1, eventName: "tool.email-polisher", createdAt: new Date().toISOString() },
      { id: 2, eventName: "agent.message", createdAt: new Date().toISOString() },
      { id: 3, eventName: "orchestration.run", createdAt: new Date().toISOString() },
    ],
    popularRoles: Object.entries(roleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([role, count]) => ({ role, count })),
  };
}
