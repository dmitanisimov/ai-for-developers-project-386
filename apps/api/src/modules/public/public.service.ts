import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";
import { notFound, slotUnavailable, validationError } from "../../common/http-errors";
import { DatabaseService } from "../../database/database.service";
import { bookings } from "../../database/schema";
import { SlotsService } from "../slots/slots.service";
import { toCreatedBooking, toPublicBooking, toPublicProfile } from "./mappers";
import type { CreateBookingDto } from "./dto/create-booking.dto";
import type { ListSlotsQuery } from "./dto/list-slots.query";

@Injectable()
export class PublicService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(SlotsService) private readonly slots: SlotsService,
  ) {}

  getProfile() {
    const profile = this.slots.getDefaultProfile();
    if (!profile) throw notFound();

    return { profile: toPublicProfile(profile) };
  }

  getSlots(query: ListSlotsQuery) {
    try {
      const slots = query.includeStatus === "true" ? this.slots.getSlotsWithStatus(query.from, query.to, query.durationMinutes) : this.slots.getAvailableSlots(query.from, query.to, query.durationMinutes);
      return { slots };
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_DATE_RANGE") {
        throw validationError();
      }

      throw error;
    }
  }

  createBooking(dto: CreateBookingDto) {
    const profile = this.slots.getDefaultProfile();
    const durationMinutes = dto.durationMinutes ?? profile?.meetingDurationMinutes;

    if (!profile || !durationMinutes || !this.slots.isAvailableSlot(dto.startAt, durationMinutes)) {
      throw slotUnavailable();
    }

    const startAt = DateTime.fromISO(dto.startAt, { zone: "utc" });
    const endAt = startAt.plus({ minutes: durationMinutes }).toUTC().toISO({ suppressMilliseconds: false });
    const now = new Date().toISOString();
    const id = randomUUID();

    if (!endAt) {
      throw validationError();
    }

    try {
      this.database.db
        .insert(bookings)
        .values({
          id,
          guestName: dto.guestName.trim(),
          guestEmail: dto.guestEmail.trim(),
          guestNotes: dto.guestNotes?.trim() || null,
          startAt: startAt.toUTC().toISO({ suppressMilliseconds: false }) ?? dto.startAt,
          endAt,
          status: "confirmed",
          createdAt: now,
          cancelledAt: null,
        })
        .run();
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw slotUnavailable();
      }

      throw error;
    }

    const booking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();
    return { booking: toCreatedBooking(booking!) };
  }

  getBooking(id: string) {
    const booking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();
    const profile = this.slots.getDefaultProfile();

    if (!booking || !profile) {
      throw notFound();
    }

    return {
      booking: toPublicBooking(booking),
      profile: {
        ownerName: profile.ownerName,
        meetingTitle: profile.meetingTitle,
        meetingDurationMinutes: profile.meetingDurationMinutes,
        timezone: profile.timezone,
      },
    };
  }
}
