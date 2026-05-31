import { Module } from "@nestjs/common";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { PublicModule } from "./modules/public/public.module";

@Module({
  imports: [HealthModule, AuthModule, PublicModule, AdminModule],
})
export class AppModule {}
