import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { AppConfig } from "../config/app.config";
import type { DatabaseService } from "./database.service";
import { adminUsers, availabilityRules, calendarProfile, eventTypes } from "./schema";

const nowIso = () => new Date().toISOString();

const assertSeedConfig = (config: AppConfig) => {
  if (!config.adminEmail || !config.adminPassword) {
    throw new Error("ADMIN_EMAIL и ADMIN_PASSWORD обязательны для seed администратора");
  }

  if (config.nodeEnv === "production" && config.adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD в production должен быть не короче 12 символов");
  }

  if (config.nodeEnv === "production" && !config.sessionSecret) {
    throw new Error("SESSION_SECRET обязателен в production");
  }
};

export const seedDatabase = async ({ db }: DatabaseService, config: AppConfig) => {
  assertSeedConfig(config);

  const currentTime = nowIso();
  const existingAdmin = db.select().from(adminUsers).limit(1).get();

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(config.adminPassword);

    db.insert(adminUsers)
      .values({
        id: randomUUID(),
        email: config.adminEmail,
        passwordHash,
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .run();
  }

  const existingProfile = db.select().from(calendarProfile).limit(1).get();

  if (!existingProfile) {
    db.insert(calendarProfile)
      .values({
        id: "default",
        ownerName: "Алексей Иванов",
        ownerTitle: "Продуктовый инженер",
        ownerBio: "Запишитесь на короткий ознакомительный звонок.",
        avatarUrl: null,
        meetingTitle: "Ознакомительный звонок",
        meetingDescription: "30-минутный звонок, чтобы обсудить ваш запрос.",
        meetingDurationMinutes: 30,
        timezone: "Europe/Moscow",
        updatedAt: currentTime,
      })
      .run();
  }

  for (const eventType of [
    {
      id: "intro-15",
      title: "Короткая консультация",
      description: "15 минут, чтобы быстро обсудить вопрос и договориться о следующих шагах.",
      durationMinutes: 15,
    },
    {
      id: "intro-30",
      title: "Ознакомительный звонок",
      description: "30 минут, чтобы подробно обсудить проект, контекст и формат работы.",
      durationMinutes: 30,
    },
  ]) {
    const existingEventType = db.select().from(eventTypes).where(eq(eventTypes.id, eventType.id)).get();

    if (!existingEventType) {
      db.insert(eventTypes)
        .values({
          ...eventType,
          createdAt: currentTime,
          updatedAt: currentTime,
        })
        .run();
    }
  }

  for (const weekday of [1, 2, 3, 4, 5, 6, 7]) {
    const existingRule = db.select().from(availabilityRules).where(eq(availabilityRules.weekday, weekday)).get();
    const enabledByDefault = config.nodeEnv === "production" ? weekday <= 5 : true;

    if (!existingRule) {
      db.insert(availabilityRules)
        .values({
          id: randomUUID(),
          weekday,
          enabled: enabledByDefault,
          startTime: "09:00",
          endTime: "17:00",
          updatedAt: currentTime,
        })
        .run();
    } else if (config.nodeEnv !== "production") {
      db.update(availabilityRules)
        .set({ enabled: true, updatedAt: currentTime })
        .where(eq(availabilityRules.weekday, weekday))
        .run();
    }
  }
};
