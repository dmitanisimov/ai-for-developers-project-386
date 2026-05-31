import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { getConfig } from "../../config/app.config";
import { DatabaseService } from "../../database/database.service";
import { adminUsers, sessions } from "../../database/schema";

const defaultSessionTtlMs = 1000 * 60 * 60 * 24 * 7;
const rememberedSessionTtlMs = 1000 * 60 * 60 * 24 * 30;

export type SessionUser = {
  email: string;
  id: string;
};

const hashSessionToken = (token: string, secret: string) => createHash("sha256").update(`${secret}:${token}`).digest("hex");

@Injectable()
export class SessionsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  createSession(userId: string, rememberMe = false) {
    const config = getConfig();
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (rememberMe ? rememberedSessionTtlMs : defaultSessionTtlMs));

    this.database.db
      .insert(sessions)
      .values({
        id: randomUUID(),
        userId,
        tokenHash: hashSessionToken(token, config.sessionSecret),
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
      })
      .run();

    return { expiresAt, rememberMe, token };
  }

  getSessionUser(request: Request): SessionUser | null {
    const config = getConfig();
    const token = request.cookies?.[config.sessionCookieName];
    if (!token) return null;

    const tokenHash = hashSessionToken(token, config.sessionSecret);
    const now = new Date().toISOString();

    const row = this.database.db
      .select({ email: adminUsers.email, id: adminUsers.id })
      .from(sessions)
      .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .get();

    return row ?? null;
  }

  deleteSession(request: Request) {
    const config = getConfig();
    const token = request.cookies?.[config.sessionCookieName];
    if (!token) return;

    this.database.db.delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(token, config.sessionSecret))).run();
  }

  setSessionCookie(response: Response, token: string, expiresAt: Date, rememberMe = false) {
    const config = getConfig();
    response.cookie(config.sessionCookieName, token, {
      expires: expiresAt,
      httpOnly: true,
      maxAge: rememberMe ? rememberedSessionTtlMs : defaultSessionTtlMs,
      path: "/",
      sameSite: "lax",
      secure: config.nodeEnv === "production",
    });
  }

  clearSessionCookie(response: Response) {
    const config = getConfig();
    response.clearCookie(config.sessionCookieName, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: config.nodeEnv === "production",
    });
  }
}
