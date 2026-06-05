import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lexiconsTable, membershipsTable, metricsTable, professionalsTable, usersTable } from "../lib/schema";
import { fallbackLexicons, fallbackMemberships, fallbackProfessionals } from "../lib/fallback-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required to seed MindReply.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);

async function tableCount(table: typeof professionalsTable | typeof membershipsTable | typeof lexiconsTable | typeof usersTable | typeof metricsTable) {
  const [result] = await db.select({ value: count() }).from(table);
  return result?.value ?? 0;
}

async function main() {
  console.log("Seeding MindReply database...");

  if ((await tableCount(professionalsTable)) === 0) {
    await db.insert(professionalsTable).values(
      fallbackProfessionals.map((p) => ({
        name: p.name,
        role: p.role,
        niche: p.niche,
        bio: p.bio,
        rating: p.rating,
        reviewCount: p.reviewCount,
        priceText: p.priceText,
        priceVoice: p.priceVoice,
        priceVideo: p.priceVideo,
        availabilityStatus: p.availabilityStatus,
        languages: p.languages.join(", "),
        photoUrl: p.photoUrl,
        specializations: p.specializations?.join(", ") ?? null,
        yearsExperience: p.yearsExperience,
      })),
    );
    console.log(`Inserted ${fallbackProfessionals.length} professionals.`);
  } else {
    console.log("Professionals already seeded; skipping.");
  }

  if ((await tableCount(membershipsTable)) === 0) {
    await db.insert(membershipsTable).values(
      fallbackMemberships.map((m) => ({
        tier: m.tier,
        name: m.name,
        price: m.price,
        description: m.description,
        features: JSON.stringify(m.features),
        highlighted: m.highlighted,
      })),
    );
    console.log(`Inserted ${fallbackMemberships.length} memberships.`);
  } else {
    console.log("Memberships already seeded; skipping.");
  }

  if ((await tableCount(lexiconsTable)) === 0) {
    await db.insert(lexiconsTable).values(
      fallbackLexicons.map((l) => ({
        name: l.name,
        category: l.category,
        description: l.description,
        terms: JSON.stringify(l.terms),
        professionalId: null,
      })),
    );
    console.log(`Inserted ${fallbackLexicons.length} lexicons.`);
  } else {
    console.log("Lexicons already seeded; skipping.");
  }

  if ((await tableCount(usersTable)) === 0) {
    await db.insert(usersTable).values([
      { name: "Signal Operator", email: "signal@mind-reply.com", membershipTier: "signal" },
      { name: "Growth Director", email: "growth@mind-reply.com", membershipTier: "growth" },
      { name: "Pro Founder", email: "pro@mind-reply.com", membershipTier: "pro" },
    ]);
    console.log("Inserted 3 users.");
  } else {
    console.log("Users already seeded; skipping.");
  }

  if ((await tableCount(metricsTable)) === 0) {
    await db.insert(metricsTable).values([
      { userId: null, eventName: "tool.text-refiner", eventValue: JSON.stringify({ creditCost: 1, seed: true }) },
      { userId: null, eventName: "tool.email-polisher", eventValue: JSON.stringify({ creditCost: 2, seed: true }) },
      { userId: null, eventName: "agent.message", eventValue: JSON.stringify({ source: "local", seed: true }) },
      { userId: null, eventName: "orchestration.run", eventValue: JSON.stringify({ risk: "controlled", seed: true }) },
      { userId: null, eventName: "background.reasoning_loop", eventValue: JSON.stringify({ cycles: 4, seed: true }) },
    ]);
    console.log("Inserted 5 metrics.");
  } else {
    console.log("Metrics already seeded; skipping.");
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
