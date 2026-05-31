import "reflect-metadata";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { securityMiddleware } from "./common/security.middleware";
import { getConfig } from "./config/app.config";
import { AppModule } from "./app.module";

const clientDistDir = join(process.cwd(), "apps/web/dist");

const bootstrap = async () => {
  const config = getConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: config.nodeEnv === "test" ? false : undefined });

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

  if (existsSync(clientDistDir)) {
    app.useStaticAssets(clientDistDir, {
      index: false,
      setHeaders: (response, pathName) => {
        if (pathName.endsWith("index.html")) {
          response.setHeader("Cache-Control", "no-store");
        }
      },
    });
  }

  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.path.startsWith("/api/")) {
      return next();
    }

    const indexPath = join(clientDistDir, "index.html");
    if (existsSync(indexPath)) {
      response.setHeader("Cache-Control", "no-store");
      return response.type("html").send(readFileSync(indexPath, "utf8"));
    }

    response.setHeader("Cache-Control", "no-store");
    return response
      .type("html")
      .send('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cal Booking</title></head><body><main><h1>Hello World</h1><p>Инфраструктурный каркас Cal Booking готов.</p></main></body></html>');
  });

  await app.init();

  await app.listen(config.port, config.host);
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
