import { pgTable, serial, text, real, integer, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const sessionModeEnum = pgEnum("session_mode", ["text", "voice", "video"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "completed", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull(),
  professionalName: text("professional_name").notNull(),
  mode: sessionModeEnum("mode").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  totalPrice: real("total_price").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;
