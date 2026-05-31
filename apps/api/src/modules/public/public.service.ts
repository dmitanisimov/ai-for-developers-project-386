import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt, lt } from "drizzle-orm";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";
import { notFound, slotOutOfWindow, slotUnavailable, validationError } from "../../common/http-errors";
import { DatabaseService } from "../../database/database.service";
import { bookings } from "../../database/schema";
import { SlotsService } from "../slots/slots.service";
import { toCreatedBooking, toEventType, toOwner, toPublicBooking, toPublicProfile } from "./mappers";
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

  getOwner() {
    const profile = this.slots.getDefaultProfile();
    if (!profile) throw notFound();

    return { owner: toOwner(profile) };
  }

  getEventTypes() {
    return { eventTypes: this.slots.getEventTypes().map(toEventType) };
  }

  getEventTypeSlots(eventTypeId: string, includeStatus?: string) {
    const response = this.slots.getSlotsForEventType(eventTypeId, includeStatus === "true");
    if (!response) throw notFound();

    return { slots: response.slots };
  }

  getSlots(query: ListSlotsQuery) {
    try {
      if (!query.from || !query.to) {
        const eventType = this.slots.getDefaultEventType();
        if (!eventType) throw notFound();
        return this.getEventTypeSlots(eventType.id, query.includeStatus);
      }

      const slots = query.includeStatus === "true" ? this.slots.getSlotsWithStatus(query.from, query.to, query.durationMinutes) : this.slots.getAvailableSlots(query.from, query.to, query.durationMinutes);
      return { slots };
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_DATE_RANGE") {
        throw validationError();
      }

      if (error instanceof Error && error.message === "SLOT_OUT_OF_WINDOW") {
        throw slotOutOfWindow();
      }

      throw error;
    }
  }

  createBooking(dto: CreateBookingDto) {
    const profile = this.slots.getDefaultProfile();
    const eventType = this.slots.getEventType(dto.eventTypeId);

    if (!profile || !eventType) {
      throw notFound();
    }

    try {
      if (!this.slots.isAvailableSlot(dto.startAt, eventType.durationMinutes)) {
        throw slotUnavailable();
      }
    } catch (error) {
      if (error instanceof Error && error.message === "SLOT_OUT_OF_WINDOW") {
        throw slotOutOfWindow();
      }

      throw error;
    }

    if (!eventType.durationMinutes) {
      throw slotUnavailable();
    }

    const startAt = DateTime.fromISO(dto.startAt, { zone: "utc" });
    const startAtIso = startAt.toUTC().toISO({ suppressMilliseconds: false }) ?? dto.startAt;
    const endAt = startAt.plus({ minutes: eventType.durationMinutes }).toUTC().toISO({ suppressMilliseconds: false });
    const now = new Date().toISOString();
    const id = randomUUID();

    if (!endAt) {
      throw validationError();
    }

    try {
      this.database.db.transaction((tx) => {
        const overlappingBooking = tx.select().from(bookings).where(and(eq(bookings.status, "confirmed"), lt(bookings.startAt, endAt), gt(bookings.endAt, startAtIso))).get();

        if (overlappingBooking) {
          throw slotUnavailable();
        }

        tx
          .insert(bookings)
          .values({
            id,
            eventTypeId: eventType.id,
            guestName: dto.guestName.trim(),
            guestEmail: dto.guestEmail.trim(),
            guestNotes: dto.guestNotes?.trim() || null,
            startAt: startAtIso,
            endAt,
            status: "confirmed",
            createdAt: now,
            cancelledAt: null,
          })
          .run();
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) {
        throw slotUnavailable();
      }

      throw error;
    }

    const booking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();
    return { booking: toCreatedBooking(booking!, eventType) };
  }

  getBooking(id: string) {
    const booking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();
    const profile = this.slots.getDefaultProfile();
    const eventTypeRows = this.slots.getEventTypes();
    const durationMinutes = booking ? DateTime.fromISO(booking.endAt).diff(DateTime.fromISO(booking.startAt), "minutes").minutes : 0;
    const eventType = booking?.eventTypeId ? this.slots.getEventType(booking.eventTypeId) : eventTypeRows.find((row) => row.durationMinutes === durationMinutes) || eventTypeRows[0];

    if (!booking || !profile || !eventType) {
      throw notFound();
    }

    return {
      booking: toPublicBooking(booking, eventType),
      owner: toOwner(profile),
    };
  }
}
