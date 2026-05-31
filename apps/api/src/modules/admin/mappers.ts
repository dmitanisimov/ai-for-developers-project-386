import type { availabilityRules, bookings, calendarProfile } from "../../database/schema";
import { toPublicProfile } from "../public/mappers";

type BookingRow = typeof bookings.$inferSelect;
type AvailabilityRuleRow = typeof availabilityRules.$inferSelect;
type ProfileRow = typeof calendarProfile.$inferSelect;

export const toAdminBooking = (booking: BookingRow) => ({
  id: booking.id,
  guestName: booking.guestName,
  guestEmail: booking.guestEmail,
  guestNotes: booking.guestNotes,
  startAt: booking.startAt,
  endAt: booking.endAt,
  status: booking.status,
  createdAt: booking.createdAt,
  cancelledAt: booking.cancelledAt,
});

export const toAdminAvailability = (rule: AvailabilityRuleRow) => ({
  weekday: rule.weekday,
  enabled: rule.enabled,
  startTime: rule.startTime,
  endTime: rule.endTime,
});

export const toAdminProfile = (profile: ProfileRow) => toPublicProfile(profile);
