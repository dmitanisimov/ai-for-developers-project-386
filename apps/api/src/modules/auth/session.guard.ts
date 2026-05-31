import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { unauthenticated } from "../../common/http-errors";
import { SessionsService } from "./sessions.service";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(SessionsService) private readonly sessions: SessionsService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const user = this.sessions.getSessionUser(request);
    if (!user) {
      throw unauthenticated();
    }

    return true;
  }
}
