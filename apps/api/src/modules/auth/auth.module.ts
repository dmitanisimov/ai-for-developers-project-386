import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionGuard } from "./session.guard";
import { SessionsService } from "./sessions.service";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, SessionGuard],
  exports: [SessionsService, SessionGuard],
})
export class AuthModule {}
