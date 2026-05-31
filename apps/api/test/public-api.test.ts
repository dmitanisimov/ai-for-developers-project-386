import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app";

describe("public booking API", () => {
  it("возвращает публичный профиль", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const response = await request(app.getHttpServer()).get("/api/public/profile").set("host", "127.0.0.1:3000");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        profile: {
          meetingDurationMinutes: 30,
          meetingTitle: "Ознакомительный звонок",
          timezone: "Europe/Moscow",
        },
      });
    } finally {
      await cleanup();
    }
  });

  it("возвращает будущие слоты и исключает занятый слот", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const monday = DateTime.utc().plus({ days: 8 }).startOf("week").toISODate();
      const slotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");
      const firstSlot = slotsResponse.body.slots[0];

      expect(slotsResponse.status).toBe(200);
      expect(firstSlot).toMatchObject({ startAt: expect.any(String), endAt: expect.any(String) });

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ startAt: firstSlot.startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com", guestNotes: "Хочу обсудить проект." });

      expect(bookingResponse.status).toBe(201);
      expect(bookingResponse.body.booking).toMatchObject({ guestEmail: "maria@example.com", startAt: firstSlot.startAt, status: "confirmed" });

      const updatedSlotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");
      expect(updatedSlotsResponse.body.slots.map((slot: { startAt: string }) => slot.startAt)).not.toContain(firstSlot.startAt);

      const statusSlotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}&includeStatus=true`).set("host", "127.0.0.1:3000");
      expect(statusSlotsResponse.body.slots).toContainEqual(expect.objectContaining({ startAt: firstSlot.startAt, status: "booked" }));
    } finally {
      await cleanup();
    }
  });

  it("отклоняет double booking", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const monday = DateTime.utc().plus({ days: 8 }).startOf("week").toISODate();
      const slotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");
      const startAt = slotsResponse.body.slots[0].startAt;
      const payload = { startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com", guestNotes: "Хочу обсудить проект." };

      const firstResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send(payload);
      const secondResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send(payload);

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body).toEqual({ error: { code: "SLOT_UNAVAILABLE", message: "Слот недоступен" } });
    } finally {
      await cleanup();
    }
  });

  it("создает 15-минутное бронирование и возвращает confirmation", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const monday = DateTime.utc().plus({ days: 8 }).startOf("week").toISODate();
      const slotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}&durationMinutes=15`).set("host", "127.0.0.1:3000");
      const startAt = slotsResponse.body.slots[0].startAt;

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ durationMinutes: 15, startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com" });
      const booking = bookingResponse.body.booking;
      const duration = DateTime.fromISO(booking.endAt).diff(DateTime.fromISO(booking.startAt), "minutes").minutes;

      expect(bookingResponse.status).toBe(201);
      expect(duration).toBe(15);

      const confirmationResponse = await request(app.getHttpServer()).get(`/api/public/bookings/${booking.id}`).set("host", "127.0.0.1:3000");
      expect(confirmationResponse.status).toBe(200);
      expect(confirmationResponse.body).toMatchObject({ booking: { id: booking.id, guestEmail: "maria@example.com", status: "confirmed" }, profile: { meetingDurationMinutes: 30, timezone: "Europe/Moscow" } });
    } finally {
      await cleanup();
    }
  });
});
