import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const calendarProfile = sqliteTable("calendar_profile", {
  id: text("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  ownerTitle: text("owner_title").notNull(),
  ownerBio: text("owner_bio").notNull(),
  avatarUrl: text("avatar_url"),
  meetingTitle: text("meeting_title").notNull(),
  meetingDescription: text("meeting_description").notNull(),
  meetingDurationMinutes: integer("meeting_duration_minutes").notNull(),
  timezone: text("timezone").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const eventTypes = sqliteTable("event_types", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const availabilityRules = sqliteTable("availability_rules", {
  id: text("id").primaryKey(),
  weekday: integer("weekday").notNull().unique(),
  enabled: integer("enabled", { mode: "boolean" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  eventTypeId: text("event_type_id"),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestNotes: text("guest_notes"),
  startAt: text("start_at").notNull(),
  endAt: text("end_at").notNull(),
  status: text("status", { enum: ["confirmed", "cancelled"] }).notNull(),
  createdAt: text("created_at").notNull(),
  cancelledAt: text("cancelled_at"),
});

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(adminUsers, {
    fields: [sessions.userId],
    references: [adminUsers.id],
  }),
}));
