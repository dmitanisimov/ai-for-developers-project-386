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

      const ownerResponse = await request(app.getHttpServer()).get("/api/public/owner").set("host", "127.0.0.1:3000");
      const eventTypesResponse = await request(app.getHttpServer()).get("/api/public/event-types").set("host", "127.0.0.1:3000");

      expect(ownerResponse.status).toBe(200);
      expect(ownerResponse.body.owner).toMatchObject({ ownerName: "Алексей Иванов", timezone: "Europe/Moscow" });
      expect(eventTypesResponse.status).toBe(200);
      expect(eventTypesResponse.body.eventTypes).toContainEqual(expect.objectContaining({ id: "intro-30", durationMinutes: 30 }));
    } finally {
      await cleanup();
    }
  });

  it("возвращает будущие слоты и исключает занятый слот", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const slotsResponse = await request(app.getHttpServer()).get("/api/public/event-types/intro-30/slots?includeStatus=true").set("host", "127.0.0.1:3000");
      const firstSlot = slotsResponse.body.slots[0];

      expect(slotsResponse.status).toBe(200);
      expect(firstSlot).toMatchObject({ startAt: expect.any(String), endAt: expect.any(String) });

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ eventTypeId: "intro-30", startAt: firstSlot.startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com", guestNotes: "Хочу обсудить проект." });

      expect(bookingResponse.status).toBe(201);
      expect(bookingResponse.body.booking).toMatchObject({ guestEmail: "maria@example.com", startAt: firstSlot.startAt, status: "confirmed" });

      const updatedSlotsResponse = await request(app.getHttpServer()).get("/api/public/event-types/intro-30/slots").set("host", "127.0.0.1:3000");
      expect(updatedSlotsResponse.body.slots.map((slot: { startAt: string }) => slot.startAt)).not.toContain(firstSlot.startAt);

      const statusSlotsResponse = await request(app.getHttpServer()).get("/api/public/event-types/intro-30/slots?includeStatus=true").set("host", "127.0.0.1:3000");
      expect(statusSlotsResponse.body.slots).toContainEqual(expect.objectContaining({ startAt: firstSlot.startAt, status: "booked" }));
    } finally {
      await cleanup();
    }
  });

  it("отклоняет double booking", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const slotsResponse = await request(app.getHttpServer()).get("/api/public/event-types/intro-30/slots").set("host", "127.0.0.1:3000");
      const startAt = slotsResponse.body.slots[0].startAt;
      const payload = { eventTypeId: "intro-30", startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com", guestNotes: "Хочу обсудить проект." };

      const firstResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send(payload);
      const secondResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ ...payload, eventTypeId: "intro-15", guestEmail: "other@example.com" });

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
      const slotsResponse = await request(app.getHttpServer()).get("/api/public/event-types/intro-15/slots").set("host", "127.0.0.1:3000");
      const startAt = slotsResponse.body.slots[0].startAt;

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ eventTypeId: "intro-15", startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com" });
      const booking = bookingResponse.body.booking;
      const duration = DateTime.fromISO(booking.endAt).diff(DateTime.fromISO(booking.startAt), "minutes").minutes;

      expect(bookingResponse.status).toBe(201);
      expect(duration).toBe(15);

      const confirmationResponse = await request(app.getHttpServer()).get(`/api/public/bookings/${booking.id}`).set("host", "127.0.0.1:3000");
      expect(confirmationResponse.status).toBe(200);
      expect(confirmationResponse.body).toMatchObject({ booking: { id: booking.id, eventTypeId: "intro-15", guestEmail: "maria@example.com", status: "confirmed" }, owner: { timezone: "Europe/Moscow" } });
    } finally {
      await cleanup();
    }
  });

  it("отклоняет бронирование вне 14-дневного окна", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-public-");

    try {
      const outsideWindowStartAt = DateTime.utc().plus({ days: 21 }).setZone("Europe/Moscow").set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).toUTC().toISO({ suppressMilliseconds: false });

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ eventTypeId: "intro-30", startAt: outsideWindowStartAt, guestName: "Мария Петрова", guestEmail: "maria@example.com" });

      expect(bookingResponse.status).toBe(400);
      expect(bookingResponse.body).toEqual({ error: { code: "SLOT_OUT_OF_WINDOW", message: "Слот вне окна записи" } });
    } finally {
      await cleanup();
    }
  });
});
