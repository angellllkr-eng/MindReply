import { pgTable, serial, text, real, boolean, pgEnum } from "drizzle-orm/pg-core";

export const membershipTierEnum = pgEnum("membership_tier", ["curator", "strategist", "sovereign"]);

export const membershipsTable = pgTable("memberships", {
  id: serial("id").primaryKey(),
  tier: membershipTierEnum("tier").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  description: text("description").notNull(),
  features: text("features").notNull(),
  highlighted: boolean("highlighted").notNull().default(false),
});

export type Membership = typeof membershipsTable.$inferSelect;
