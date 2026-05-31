import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt, lt } from "drizzle-orm";
import { DateTime } from "luxon";
import { DatabaseService } from "../../database/database.service";
import { availabilityRules, bookings, calendarProfile, eventTypes } from "../../database/schema";

export type AvailableSlot = {
  endAt: string;
  startAt: string;
};

export type SlotWithStatus = AvailableSlot & {
  status: "available" | "booked";
};

const bookingWindowDays = 14;

const parseTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
};

const toUtcIso = (dateTime: DateTime) => dateTime.toUTC().toISO({ suppressMilliseconds: false });

@Injectable()
export class SlotsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  getDefaultProfile() {
    return this.database.db.select().from(calendarProfile).limit(1).get();
  }

  getEventTypes() {
    return this.database.db.select().from(eventTypes).all().sort((left, right) => left.durationMinutes - right.durationMinutes || left.title.localeCompare(right.title));
  }

  getEventType(id: string) {
    return this.database.db.select().from(eventTypes).where(eq(eventTypes.id, id)).get();
  }

  getDefaultEventType() {
    return this.getEventTypes()[0];
  }

  getBookingWindow(now = DateTime.utc()) {
    const profile = this.getDefaultProfile();
    if (!profile) return null;

    const fromDate = now.setZone(profile.timezone).startOf("day");
    const toDate = fromDate.plus({ days: bookingWindowDays - 1 });
    return { fromDate, toDate };
  }

  private ensureRangeInBookingWindow(fromDate: DateTime, toDate: DateTime, now: DateTime) {
    const window = this.getBookingWindow(now);
    if (!window || fromDate < window.fromDate || toDate > window.toDate) {
      throw new Error("SLOT_OUT_OF_WINDOW");
    }
  }

  getSlotsWithStatus(from: string, to: string, durationMinutes?: number, now = DateTime.utc()): SlotWithStatus[] {
    const profile = this.getDefaultProfile();
    if (!profile) return [];

    const slotDurationMinutes = durationMinutes ?? profile.meetingDurationMinutes;
    const fromDate = DateTime.fromISO(from, { zone: profile.timezone }).startOf("day");
    const toDate = DateTime.fromISO(to, { zone: profile.timezone }).startOf("day");

    if (!fromDate.isValid || !toDate.isValid || toDate < fromDate) {
      throw new Error("INVALID_DATE_RANGE");
    }

    this.ensureRangeInBookingWindow(fromDate, toDate, now);

    const rules = this.database.db.select().from(availabilityRules).all();
    const rulesByWeekday = new Map(rules.map((rule) => [rule.weekday, rule]));
    const rangeStartUtc = fromDate.toUTC().toISO() ?? "";
    const rangeEndUtc = toDate.plus({ days: 1 }).toUTC().toISO() ?? "";
    const confirmedBookings = this.database.db
      .select({ endAt: bookings.endAt, startAt: bookings.startAt })
      .from(bookings)
      .where(and(eq(bookings.status, "confirmed"), gt(bookings.endAt, rangeStartUtc), lt(bookings.startAt, rangeEndUtc)))
      .all();

    const slots: SlotWithStatus[] = [];
    let cursor = fromDate;

    while (cursor <= toDate) {
      const rule = rulesByWeekday.get(cursor.weekday);

      if (rule?.enabled) {
        const startTime = parseTime(rule.startTime);
        const endTime = parseTime(rule.endTime);
        let slotStart = cursor.set({ hour: startTime.hour, minute: startTime.minute });
        const dayEnd = cursor.set({ hour: endTime.hour, minute: endTime.minute });

        while (slotStart.plus({ minutes: slotDurationMinutes }) <= dayEnd) {
          const slotEnd = slotStart.plus({ minutes: slotDurationMinutes });
          const startAt = toUtcIso(slotStart);
          const endAt = toUtcIso(slotEnd);

          if (startAt && endAt && slotStart.toUTC() > now) {
            const overlapsBooking = confirmedBookings.some((booking) => startAt < booking.endAt && endAt > booking.startAt);
            slots.push({ startAt, endAt, status: overlapsBooking ? "booked" : "available" });
          }

          slotStart = slotEnd;
        }
      }

      cursor = cursor.plus({ days: 1 });
    }

    return slots;
  }

  getAvailableSlots(from: string, to: string, durationMinutes?: number, now = DateTime.utc()): AvailableSlot[] {
    return this.getSlotsWithStatus(from, to, durationMinutes, now)
      .filter((slot) => slot.status === "available")
      .map(({ endAt, startAt }) => ({ endAt, startAt }));
  }

  getSlotsForEventType(eventTypeId: string, includeStatus = false, now = DateTime.utc()) {
    const eventType = this.getEventType(eventTypeId);
    const window = this.getBookingWindow(now);

    if (!eventType || !window) return null;

    const from = window.fromDate.toISODate();
    const to = window.toDate.toISODate();

    if (!from || !to) return null;

    const slots = includeStatus ? this.getSlotsWithStatus(from, to, eventType.durationMinutes, now) : this.getAvailableSlots(from, to, eventType.durationMinutes, now);
    return { eventType, slots };
  }

  isAvailableSlot(startAt: string, durationMinutes?: number, now = DateTime.utc()) {
    const profile = this.getDefaultProfile();
    if (!profile) return false;

    const localDate = DateTime.fromISO(startAt, { zone: "utc" }).setZone(profile.timezone).toISODate();
    if (!localDate) return false;

    return this.getAvailableSlots(localDate, localDate, durationMinutes, now).some((slot) => slot.startAt === startAt);
  }
}
