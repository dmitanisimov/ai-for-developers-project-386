import { Inject, Injectable } from "@nestjs/common";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { invalidCredentials, unauthenticated } from "../../common/http-errors";
import { DatabaseService } from "../../database/database.service";
import { adminUsers } from "../../database/schema";
import type { LoginDto } from "./dto/login.dto";
import { SessionsService } from "./sessions.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(SessionsService) private readonly sessions: SessionsService,
  ) {}

  async login(dto: LoginDto, response: Response) {
    const admin = this.database.db.select().from(adminUsers).where(eq(adminUsers.email, dto.email)).get();
    if (!admin) {
      throw invalidCredentials();
    }

    const passwordMatches = await argon2.verify(admin.passwordHash, dto.password);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    const session = this.sessions.createSession(admin.id, dto.rememberMe ?? false);
    this.sessions.setSessionCookie(response, session.token, session.expiresAt, session.rememberMe);

    return { user: { email: admin.email } };
  }

  logout(request: Request, response: Response) {
    this.sessions.deleteSession(request);
    this.sessions.clearSessionCookie(response);
  }

  me(request: Request) {
    const user = this.sessions.getSessionUser(request);
    if (!user) {
      throw unauthenticated();
    }

    return { user: { email: user.email } };
  }
}
