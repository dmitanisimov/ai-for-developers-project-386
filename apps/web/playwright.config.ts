import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "../..");
const port = Number(process.env.E2E_PORT || 4100);
const databasePath = process.env.E2E_DATABASE_PATH || "/tmp/opencode/cal-booking-e2e.sqlite";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node -e "const fs=require('fs'); for (const suffix of ['', '-shm', '-wal']) fs.rmSync('${databasePath}' + suffix, { force: true })" && npm run build && APP_PORT=${port} APP_HOST=localhost NODE_ENV=development DATABASE_URL=file:${databasePath} ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=local-dev-password SESSION_SECRET=local-dev-session-secret npm run start -w apps/api`,
    cwd: rootDir,
    reuseExistingServer: false,
    timeout: 120_000,
    url: `http://127.0.0.1:${port}/api/health`,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
