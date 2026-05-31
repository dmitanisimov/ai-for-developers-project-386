import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { notFound, validationError } from "../../common/http-errors";
import { DatabaseService } from "../../database/database.service";
import { availabilityRules, bookings, calendarProfile } from "../../database/schema";
import { toAdminAvailability, toAdminBooking, toAdminProfile } from "./mappers";
import type { ListBookingsQuery } from "./dto/list-bookings.query";
import type { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

const getFilteredBookings = (database: DatabaseService, status: ListBookingsQuery["status"]) => {
  const now = new Date().toISOString();
  const rows = database.db.select().from(bookings).all();

  return rows
    .filter((booking) => {
      if (status === "all") return true;
      if (status === "cancelled") return booking.status === "cancelled";
      if (booking.status !== "confirmed") return false;

      return status === "upcoming" ? booking.startAt >= now : booking.startAt < now;
    })
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
};

@Injectable()
export class AdminService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  getBookings(status: ListBookingsQuery["status"] = "upcoming") {
    return { bookings: getFilteredBookings(this.database, status).map(toAdminBooking) };
  }

  cancelBooking(id: string) {
    const booking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();
    if (!booking) throw notFound();

    if (booking.status !== "cancelled") {
      this.database.db
        .update(bookings)
        .set({ cancelledAt: new Date().toISOString(), status: "cancelled" })
        .where(eq(bookings.id, id))
        .run();
    }

    const updatedBooking = this.database.db.select().from(bookings).where(eq(bookings.id, id)).get();

    return {
      booking: {
        id: updatedBooking!.id,
        status: updatedBooking!.status,
        cancelledAt: updatedBooking!.cancelledAt,
      },
    };
  }

  getAvailability() {
    return {
      availability: this.database.db
        .select()
        .from(availabilityRules)
        .all()
        .sort((left, right) => left.weekday - right.weekday)
        .map(toAdminAvailability),
    };
  }

  updateAvailability(dto: UpdateAvailabilityDto) {
    if (dto.availability.length !== 7 || new Set(dto.availability.map((rule) => rule.weekday)).size !== 7 || dto.availability.some((rule) => rule.enabled && rule.startTime >= rule.endTime)) {
      throw validationError();
    }

    const updatedAt = new Date().toISOString();

    this.database.db.transaction((tx) => {
      for (const rule of dto.availability) {
        tx
          .insert(availabilityRules)
          .values({
            id: `weekday_${rule.weekday}`,
            weekday: rule.weekday,
            enabled: rule.enabled,
            startTime: rule.startTime,
            endTime: rule.endTime,
            updatedAt,
          })
          .onConflictDoUpdate({
            target: availabilityRules.weekday,
            set: {
              enabled: rule.enabled,
              startTime: rule.startTime,
              endTime: rule.endTime,
              updatedAt,
            },
          })
          .run();
      }
    });

    return this.getAvailability();
  }

  getProfile() {
    const profile = this.database.db.select().from(calendarProfile).limit(1).get();
    if (!profile) throw notFound();

    return { profile: toAdminProfile(profile) };
  }

  updateProfile(dto: UpdateProfileDto) {
    const profile = this.database.db.select().from(calendarProfile).limit(1).get();
    if (!profile) throw notFound();

    this.database.db
      .update(calendarProfile)
      .set({
        ...dto,
        ownerName: dto.ownerName.trim(),
        ownerTitle: dto.ownerTitle.trim(),
        ownerBio: dto.ownerBio.trim(),
        avatarUrl: dto.avatarUrl || null,
        meetingTitle: dto.meetingTitle.trim(),
        meetingDescription: dto.meetingDescription.trim(),
        timezone: dto.timezone.trim(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(calendarProfile.id, profile.id))
      .run();

    const updatedProfile = this.database.db.select().from(calendarProfile).where(eq(calendarProfile.id, profile.id)).get();

    return { profile: toAdminProfile(updatedProfile!) };
  }
}
