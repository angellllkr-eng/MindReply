import { pgTable, serial, text, real, integer, pgEnum } from "drizzle-orm/pg-core";

export const availabilityStatusEnum = pgEnum("availability_status", ["available", "busy", "fully_booked"]);

export const professionalsTable = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  niche: text("niche").notNull(),
  bio: text("bio").notNull(),
  rating: real("rating").notNull().default(5.0),
  reviewCount: integer("review_count").notNull().default(0),
  priceText: real("price_text").notNull(),
  priceVoice: real("price_voice").notNull(),
  priceVideo: real("price_video").notNull(),
  availabilityStatus: availabilityStatusEnum("availability_status").notNull().default("available"),
  languages: text("languages").notNull().default("English"),
  photoUrl: text("photo_url").notNull(),
  specializations: text("specializations"),
  yearsExperience: integer("years_experience"),
});

export type Professional = typeof professionalsTable.$inferSelect;
export type InsertProfessional = typeof professionalsTable.$inferInsert;
