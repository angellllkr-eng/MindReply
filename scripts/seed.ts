import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  professionals,
  bookings,
  memberships,
  lexicons,
} from '../lib/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  console.log('🌱 Seeding MindReply database...');

  // Clear existing (optional, comment out if you want to keep data)
  await db.delete(bookings);
  await db.delete(lexicons);
  await db.delete(memberships);
  await db.delete(professionals);

  // Memberships
  await db.insert(memberships).values([
    {
      id: 'curator',
      name: 'Curator',
      priceMonthly: 19,
      description: 'For individuals who want refined, guided communication support.',
    },
    {
      id: 'strategist',
      name: 'Strategist',
      priceMonthly: 49,
      description: 'For professionals and founders who need consistent strategic clarity.',
    },
    {
      id: 'sovereign',
      name: 'Sovereign',
      priceMonthly: 129,
      description: 'For leaders who want a fully tailored behavioral intelligence layer.',
    },
  ]);

  // Professionals
  await db.insert(professionals).values([
    {
      id: 'child-psychologist',
      name: 'Child Psychologist',
      title: 'PC/phone addiction, school stress, emotional regulation',
      pricePerHour: 80,
      rating: 4.9,
      isAvailable: true,
      languages: ['en', 'bg'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'adult-mental-health',
      name: 'Adult Mental Health Support',
      title: 'Burnout, anxiety, emotional overload',
      pricePerHour: 90,
      rating: 4.8,
      isAvailable: true,
      languages: ['en', 'bg', 'de'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'relationship-coach',
      name: 'Relationship & Communication Coach',
      title: 'Conflict de-escalation, honest conversations, boundaries',
      pricePerHour: 85,
      rating: 4.7,
      isAvailable: true,
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'accountant-tax',
      name: 'Accountant / Tax Advisor',
      title: 'Small business, freelancers, international structure basics',
      pricePerHour: 110,
      rating: 4.6,
      isAvailable: true,
      languages: ['en', 'bg'],
      modeText: true,
      modeVoice: true,
      modeVideo: false,
    },
    {
      id: 'lawyer-legal',
      name: 'Lawyer / Legal Advisor',
      title: 'Contracts, risk, basic compliance orientation',
      pricePerHour: 140,
      rating: 4.7,
      isAvailable: false, // fully booked example
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'financial-advisor',
      name: 'Financial Advisor',
      title: 'Personal finance structure, runway, basic allocation thinking',
      pricePerHour: 120,
      rating: 4.5,
      isAvailable: true,
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'hr-leader-pa',
      name: 'HR Leader with PA',
      title: 'Hiring, feedback, people systems, executive support',
      pricePerHour: 95,
      rating: 4.6,
      isAvailable: true,
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'executive-assistant',
      name: 'Executive Assistant / Ops',
      title: 'Calendar, ops, follow-through, friction removal',
      pricePerHour: 70,
      rating: 4.8,
      isAvailable: true,
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: false,
    },
    {
      id: 'event-manager',
      name: 'Event Manager',
      title: 'Launches, retreats, private events, logistics',
      pricePerHour: 85,
      rating: 4.4,
      isAvailable: true,
      languages: ['en', 'bg'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
    {
      id: 'business-consultant',
      name: 'Business Consultant / Strategy',
      title: 'Positioning, offers, funnels, behavioral communication strategy',
      pricePerHour: 150,
      rating: 4.9,
      isAvailable: true,
      languages: ['en'],
      modeText: true,
      modeVoice: true,
      modeVideo: true,
    },
  ]);

  // Lexicons
  await db.insert(lexicons).values([
    {
      id: 'founder-clarity',
      name: 'Founder Clarity Lexicon',
      description: 'Language patterns for founders under pressure: calm, precise, decisive.',
    },
    {
      id: 'parent-soft-power',
      name: 'Parent Soft Power Lexicon',
      description: 'Gentle but firm language for parents with overwhelmed kids.',
    },
    {
      id: 'executive-ops',
      name: 'Executive Ops Lexicon',
      description: 'Operational clarity, delegation, and follow-up language.',
    },
  ]);

  console.log('✅ Seed complete.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
