import { Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getConfig } from "../config/app.config";
import { migrateDatabase } from "./migrate";
import { seedDatabase } from "./seed";
import * as schema from "./schema";

const normalizeDatabasePath = (databaseUrl: string) => (databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl);

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  databasePath = "";
  db!: ReturnType<typeof drizzle<typeof schema>>;
  sqlite!: Database.Database;

  async onModuleInit() {
    const config = getConfig();
    this.databasePath = resolve(normalizeDatabasePath(config.databaseUrl));
    mkdirSync(dirname(this.databasePath), { recursive: true });

    this.sqlite = new Database(this.databasePath);
    this.sqlite.pragma("journal_mode = WAL");
    this.sqlite.pragma("foreign_keys = ON");
    this.db = drizzle(this.sqlite, { schema });

    migrateDatabase(this);
    await seedDatabase(this, config);
  }

  onApplicationShutdown() {
    this.sqlite?.close();
  }
}
