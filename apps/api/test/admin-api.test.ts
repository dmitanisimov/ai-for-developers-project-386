import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app";

const getCookieHeader = (setCookie: string | string[] | undefined) => {
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!cookie) throw new Error("Set-Cookie header отсутствует");
  return cookie.split(";")[0];
};

const nextFutureMonday = () => DateTime.utc().plus({ days: 8 }).startOf("week").toISODate();

const fullAvailability = (overrides: Partial<{ enabled: boolean; endTime: string; startTime: string; weekday: number }> = {}) =>
  [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    enabled: weekday <= 5,
    startTime: "09:00",
    endTime: "17:00",
    ...overrides,
    ...(overrides.weekday && overrides.weekday !== weekday ? { enabled: weekday <= 5, startTime: "09:00", endTime: "17:00" } : {}),
  }));

const login = async (app: Awaited<ReturnType<typeof createTestApp>>["app"]) => {
  const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").set("host", "127.0.0.1:3000").send({ email: "admin@example.com", password: "local-dev-password" });
  return getCookieHeader(loginResponse.headers["set-cookie"]);
};

describe("admin API", () => {
  it("не отдает admin bookings без session", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-admin-");

    try {
      const response = await request(app.getHttpServer()).get("/api/admin/bookings").set("host", "127.0.0.1:3000");

      expect(response.status).toBe(401);
    } finally {
      await cleanup();
    }
  });

  it("возвращает список bookings и отменяет booking", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-admin-");

    try {
      const cookie = await login(app);
      const monday = nextFutureMonday();
      const slotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");
      const startAt = slotsResponse.body.slots[0].startAt;

      const bookingResponse = await request(app.getHttpServer()).post("/api/public/bookings").set("host", "127.0.0.1:3000").send({ startAt, guestName: "Мария Петрова", guestEmail: "maria@example.com" });
      const bookingId = bookingResponse.body.booking.id;

      const listResponse = await request(app.getHttpServer()).get("/api/admin/bookings?status=upcoming").set("host", "127.0.0.1:3000").set("cookie", cookie);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.bookings).toContainEqual(expect.objectContaining({ id: bookingId, guestEmail: "maria@example.com", status: "confirmed" }));

      const cancelResponse = await request(app.getHttpServer()).patch(`/api/admin/bookings/${bookingId}/cancel`).set("host", "127.0.0.1:3000").set("cookie", cookie);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.booking).toMatchObject({ id: bookingId, status: "cancelled" });

      const updatedSlotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");
      expect(updatedSlotsResponse.body.slots.map((slot: { startAt: string }) => slot.startAt)).toContain(startAt);
    } finally {
      await cleanup();
    }
  });

  it("обновляет availability и влияет на public slots", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-admin-");

    try {
      const cookie = await login(app);
      const monday = nextFutureMonday();
      const disabledMonday = fullAvailability().map((rule) => (rule.weekday === 1 ? { ...rule, enabled: false } : rule));

      const updateResponse = await request(app.getHttpServer()).put("/api/admin/availability").set("host", "127.0.0.1:3000").set("cookie", cookie).send({ availability: disabledMonday });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.availability).toHaveLength(7);

      const slotsResponse = await request(app.getHttpServer()).get(`/api/public/slots?from=${monday}&to=${monday}`).set("host", "127.0.0.1:3000");

      expect(slotsResponse.status).toBe(200);
      expect(slotsResponse.body.slots).toEqual([]);
    } finally {
      await cleanup();
    }
  });

  it("обновляет public profile", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-admin-");

    try {
      const cookie = await login(app);
      const payload = {
        ownerName: "Ирина Смирнова",
        ownerTitle: "AI Consultant",
        ownerBio: "Помогаю запускать AI-проекты.",
        avatarUrl: null,
        meetingTitle: "Разбор проекта",
        meetingDescription: "Обсудим цели и следующий шаг.",
        meetingDurationMinutes: 45,
        timezone: "Europe/Moscow",
      };

      const updateResponse = await request(app.getHttpServer()).put("/api/admin/profile").set("host", "127.0.0.1:3000").set("cookie", cookie).send(payload);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual({ profile: payload });

      const publicResponse = await request(app.getHttpServer()).get("/api/public/profile").set("host", "127.0.0.1:3000");

      expect(publicResponse.body).toEqual({ profile: payload });
    } finally {
      await cleanup();
    }
  });
});
