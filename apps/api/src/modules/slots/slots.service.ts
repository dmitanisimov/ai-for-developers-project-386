import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, lte } from "drizzle-orm";
import { DateTime } from "luxon";
import { DatabaseService } from "../../database/database.service";
import { availabilityRules, bookings, calendarProfile } from "../../database/schema";

export type AvailableSlot = {
  endAt: string;
  startAt: string;
};

export type SlotWithStatus = AvailableSlot & {
  status: "available" | "booked";
};

const maxRangeDays = 31;

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

  getSlotsWithStatus(from: string, to: string, durationMinutes?: number, now = DateTime.utc()): SlotWithStatus[] {
    const profile = this.getDefaultProfile();
    if (!profile) return [];

    const slotDurationMinutes = durationMinutes ?? profile.meetingDurationMinutes;
    const fromDate = DateTime.fromISO(from, { zone: profile.timezone }).startOf("day");
    const toDate = DateTime.fromISO(to, { zone: profile.timezone }).startOf("day");

    if (!fromDate.isValid || !toDate.isValid || toDate < fromDate || toDate.diff(fromDate, "days").days > maxRangeDays) {
      throw new Error("INVALID_DATE_RANGE");
    }

    const rules = this.database.db.select().from(availabilityRules).all();
    const rulesByWeekday = new Map(rules.map((rule) => [rule.weekday, rule]));
    const rangeStartUtc = fromDate.toUTC().toISO() ?? "";
    const rangeEndUtc = toDate.plus({ days: 1 }).toUTC().toISO() ?? "";
    const confirmedBookings = this.database.db
      .select({ endAt: bookings.endAt, startAt: bookings.startAt })
      .from(bookings)
      .where(and(eq(bookings.status, "confirmed"), gte(bookings.startAt, rangeStartUtc), lte(bookings.startAt, rangeEndUtc)))
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

  isAvailableSlot(startAt: string, durationMinutes?: number) {
    const profile = this.getDefaultProfile();
    if (!profile) return false;

    const localDate = DateTime.fromISO(startAt, { zone: "utc" }).setZone(profile.timezone).toISODate();
    if (!localDate) return false;

    return this.getAvailableSlots(localDate, localDate, durationMinutes).some((slot) => slot.startAt === startAt);
  }
}
