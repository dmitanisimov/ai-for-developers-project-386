export type AppConfig = {
  adminEmail: string;
  adminPassword: string;
  appHost: string;
  databaseUrl: string;
  host: string;
  nodeEnv: string;
  port: number;
  sessionCookieName: string;
  sessionSecret: string;
};

export const getConfig = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const port = Number(process.env.APP_PORT || 3000);

  return {
    adminEmail: process.env.ADMIN_EMAIL || (isProduction ? "" : "admin@example.com"),
    adminPassword: process.env.ADMIN_PASSWORD || (isProduction ? "" : "local-dev-password"),
    appHost: process.env.APP_HOST || "localhost",
    databaseUrl: process.env.DATABASE_URL || "file:./data/cal-booking.sqlite",
    host: "0.0.0.0",
    nodeEnv,
    port,
    sessionCookieName: process.env.SESSION_COOKIE_NAME || "cal_booking_session",
    sessionSecret: process.env.SESSION_SECRET || (isProduction ? "" : "local-dev-session-secret"),
  };
};
