import type { DatabaseService } from "./database.service";

export const migrateDatabase = ({ sqlite }: DatabaseService) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calendar_profile (
      id TEXT PRIMARY KEY NOT NULL,
      owner_name TEXT NOT NULL,
      owner_title TEXT NOT NULL,
      owner_bio TEXT NOT NULL,
      avatar_url TEXT,
      meeting_title TEXT NOT NULL,
      meeting_description TEXT NOT NULL,
      meeting_duration_minutes INTEGER NOT NULL,
      timezone TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS availability_rules (
      id TEXT PRIMARY KEY NOT NULL,
      weekday INTEGER NOT NULL UNIQUE,
      enabled INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY NOT NULL,
      event_type_id TEXT,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_notes TEXT,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
      created_at TEXT NOT NULL,
      cancelled_at TEXT
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS bookings_event_type_id_idx ON bookings(event_type_id);
    CREATE INDEX IF NOT EXISTS bookings_start_at_idx ON bookings(start_at);
    CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_confirmed_start_at_unique ON bookings(start_at) WHERE status = 'confirmed';
  `);

  const bookingColumns = sqlite.prepare("PRAGMA table_info(bookings)").all() as Array<{ name: string }>;
  if (!bookingColumns.some((column) => column.name === "event_type_id")) {
    sqlite.exec(`
      ALTER TABLE bookings ADD COLUMN event_type_id TEXT;
      CREATE INDEX IF NOT EXISTS bookings_event_type_id_idx ON bookings(event_type_id);
    `);
  }
};
