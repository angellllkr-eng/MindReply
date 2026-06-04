import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const lexiconsTable = pgTable("lexicons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  terms: text("terms").notNull(),
  category: text("category").notNull(),
  professionalId: integer("professional_id"),
});

export type Lexicon = typeof lexiconsTable.$inferSelect;
