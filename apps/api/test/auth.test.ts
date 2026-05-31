import { describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "./test-app";

const getCookieHeader = (setCookie: string | string[] | undefined) => {
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!cookie) throw new Error("Set-Cookie header отсутствует");
  return cookie.split(";")[0];
};

describe("auth API", () => {
  it("логинит администратора и возвращает me", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-auth-");

    try {
      const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").set("host", "127.0.0.1:3000").send({ email: "admin@example.com", password: "local-dev-password" });
      const cookie = getCookieHeader(loginResponse.headers["set-cookie"]);

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toEqual({ user: { email: "admin@example.com" } });
      expect(loginResponse.headers["set-cookie"]?.[0]).toContain("HttpOnly");

      const meResponse = await request(app.getHttpServer()).get("/api/auth/me").set("host", "127.0.0.1:3000").set("cookie", cookie);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toEqual({ user: { email: "admin@example.com" } });
    } finally {
      await cleanup();
    }
  });

  it("отклоняет неверный пароль и очищает session на logout", async () => {
    const { app, cleanup } = await createTestApp("cal-booking-auth-");

    try {
      const invalidResponse = await request(app.getHttpServer()).post("/api/auth/login").set("host", "127.0.0.1:3000").send({ email: "admin@example.com", password: "wrong" });

      expect(invalidResponse.status).toBe(401);
      expect(invalidResponse.body).toEqual({ error: { code: "INVALID_CREDENTIALS", message: "Неверный email или пароль" } });

      const loginResponse = await request(app.getHttpServer()).post("/api/auth/login").set("host", "127.0.0.1:3000").send({ email: "admin@example.com", password: "local-dev-password", rememberMe: true });
      const cookie = getCookieHeader(loginResponse.headers["set-cookie"]);

      expect(loginResponse.headers["set-cookie"]?.[0]).toContain("Max-Age=2592000");

      const logoutResponse = await request(app.getHttpServer()).post("/api/auth/logout").set("host", "127.0.0.1:3000").set("cookie", cookie);
      expect(logoutResponse.status).toBe(204);

      const meResponse = await request(app.getHttpServer()).get("/api/auth/me").set("host", "127.0.0.1:3000").set("cookie", cookie);
      expect(meResponse.status).toBe(401);
    } finally {
      await cleanup();
    }
  });
});
