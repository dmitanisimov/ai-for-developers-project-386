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
});
