import "reflect-metadata";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiExceptionFilter } from "../src/common/api-exception.filter";
import { securityMiddleware } from "../src/common/security.middleware";
import { AppModule } from "../src/app.module";

export type TestApp = {
  app: NestExpressApplication;
  cleanup: () => Promise<void>;
};

export const createTestApp = async (prefix: string): Promise<TestApp> => {
  const tempDir = mkdtempSync(join(tmpdir(), prefix));

  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "local-dev-password";
  process.env.APP_HOST = "localhost";
  process.env.PORT = "3000";
  process.env.DATABASE_URL = `file:${join(tempDir, "test.sqlite")}`;
  process.env.NODE_ENV = "test";
  process.env.SESSION_COOKIE_NAME = "cal_booking_session";
  process.env.SESSION_SECRET = "test-session-secret";

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();

  app.use(securityMiddleware);
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      exceptionFactory: () => new BadRequestException({ error: { code: "VALIDATION_ERROR", message: "Некорректный запрос" } }),
    }),
  );

  await app.init();

  return {
    app,
    cleanup: async () => {
      await app.close();
      rmSync(tempDir, { force: true, recursive: true });
    },
  };
};
