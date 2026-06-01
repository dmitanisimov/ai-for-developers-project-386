import { describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app";

describe("health API", () => {
  it("возвращает ok", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-health-");

    try {
      const response = await request(app.getHttpServer()).get("/api/health").set("host", "127.0.0.1:3000");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    } finally {
      await cleanup();
    }
  });

  it("не блокирует произвольный host, если APP_HOST не задан", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-health-");
    const previousAppHost = process.env.APP_HOST;

    try {
      process.env.APP_HOST = "";
      const response = await request(app.getHttpServer()).get("/api/health").set("host", "cal-booking.onrender.com");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    } finally {
      if (previousAppHost === undefined) {
        delete process.env.APP_HOST;
      } else {
        process.env.APP_HOST = previousAppHost;
      }
      await cleanup();
    }
  });

  it("разрешает host из APP_HOST", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-health-");
    const previousAppHost = process.env.APP_HOST;

    try {
      process.env.APP_HOST = "https://cal-booking.onrender.com";
      const response = await request(app.getHttpServer()).get("/api/health").set("host", "cal-booking.onrender.com");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    } finally {
      if (previousAppHost === undefined) {
        delete process.env.APP_HOST;
      } else {
        process.env.APP_HOST = previousAppHost;
      }
      await cleanup();
    }
  });
});
