import type { bookings, calendarProfile } from "../../database/schema";

type ProfileRow = typeof calendarProfile.$inferSelect;
type BookingRow = typeof bookings.$inferSelect;

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

export const toPublicBooking = (booking: BookingRow) => ({
  id: booking.id,
  guestName: booking.guestName,
  guestEmail: booking.guestEmail,
  guestNotes: booking.guestNotes,
  startAt: booking.startAt,
  endAt: booking.endAt,
  status: booking.status,
});

export const toCreatedBooking = (booking: BookingRow) => ({
  ...toPublicBooking(booking),
  createdAt: booking.createdAt,
});
