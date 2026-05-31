import type { bookings, calendarProfile, eventTypes } from "../../database/schema";

type ProfileRow = typeof calendarProfile.$inferSelect;
type BookingRow = typeof bookings.$inferSelect;
type EventTypeRow = typeof eventTypes.$inferSelect;

export const toEventType = (eventType: EventTypeRow) => ({
  id: eventType.id,
  title: eventType.title,
  description: eventType.description,
  durationMinutes: eventType.durationMinutes,
});

export const toOwner = (profile: ProfileRow) => ({
  ownerName: profile.ownerName,
  ownerTitle: profile.ownerTitle,
  ownerBio: profile.ownerBio,
  avatarUrl: profile.avatarUrl,
  timezone: profile.timezone,
});

export const toPublicProfile = (profile: ProfileRow) => ({
  ownerName: profile.ownerName,
  ownerTitle: profile.ownerTitle,
  ownerBio: profile.ownerBio,
  avatarUrl: profile.avatarUrl,
  meetingTitle: profile.meetingTitle,
  meetingDescription: profile.meetingDescription,
  meetingDurationMinutes: profile.meetingDurationMinutes,
  timezone: profile.timezone,
});

export const toPublicBooking = (booking: BookingRow, eventType: EventTypeRow) => ({
  id: booking.id,
  eventTypeId: eventType.id,
  eventType: toEventType(eventType),
  guestName: booking.guestName,
  guestEmail: booking.guestEmail,
  guestNotes: booking.guestNotes,
  startAt: booking.startAt,
  endAt: booking.endAt,
  status: booking.status,
});

export const toCreatedBooking = (booking: BookingRow, eventType: EventTypeRow) => ({
  ...toPublicBooking(booking, eventType),
  createdAt: booking.createdAt,
});
