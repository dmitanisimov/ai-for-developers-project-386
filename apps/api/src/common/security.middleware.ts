import type { NextFunction, Request, Response } from "express";
import { getConfig } from "../config/app.config";

const getAllowedHosts = () => {
  const config = getConfig();
  const appHosts = config.appHost
    .split(",")
    .map((host) => host.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .filter(Boolean);

  if (appHosts.length === 0) {
    return null;
  }

  return new Set([
    ...appHosts,
    ...appHosts.map((host) => `${host}:${config.port}`),
    "cal-booking-app",
    `cal-booking-app:${config.port}`,
    "localhost",
    `localhost:${config.port}`,
    "127.0.0.1",
    `127.0.0.1:${config.port}`,
  ]);
};

export const securityMiddleware = (request: Request, response: Response, next: NextFunction) => {
  response.header("Content-Security-Policy", "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; script-src 'self'; style-src 'self'");
  response.header("Cross-Origin-Opener-Policy", "same-origin");
  response.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.header("Referrer-Policy", "no-referrer");
  response.header("X-Content-Type-Options", "nosniff");
  response.header("X-Frame-Options", "DENY");

  const config = getConfig();
  if (config.nodeEnv === "production") {
    response.header("Strict-Transport-Security", "max-age=15552000");
  }

  const requestHost = request.headers.host;
  const allowedHosts = getAllowedHosts();
  if (allowedHosts && (!requestHost || !allowedHosts.has(requestHost))) {
    return response.status(400).json({ error: { code: "INVALID_HOST", message: "Некорректный host" } });
  }

  return next();
};
