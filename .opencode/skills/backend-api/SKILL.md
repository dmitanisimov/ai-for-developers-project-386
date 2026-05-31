---
name: backend-api
description: Использовать при реализации NestJS, SQLite, Drizzle, sessions, auth guards, booking rules или server validation для Cal Booking.
---

# Backend API

Используй этот skill для backend implementation tasks.

## Architecture

- NestJS обслуживает API controllers и собранное React app в одном production контейнере.
- SQLite хранит admin users, sessions, profile, availability rules и bookings.
- Drizzle отвечает за schema и migrations.
- DTO classes, `class-validator`, `class-transformer` и глобальный `ValidationPipe` валидируют весь external input.
- Server вычисляет available booking slots.

## Security

- Хешировать admin passwords через Argon2.
- Хранить только session token hashes.
- Использовать HttpOnly cookies для sessions.
- Использовать Secure cookies в production.
- По умолчанию использовать SameSite=Lax.
- Отклонять unauthenticated access к `/api/admin/*` через NestJS guard.
- Отклонять double bookings на database/transaction boundary.

## Implementation Order

1. NestJS config, app module и bootstrap.
2. Database schema и migration.
3. Seed admin/profile/availability.
4. Auth controller/service и session guard.
5. Public profile и slot controllers/services.
6. Booking creation и lookup.
7. Admin bookings, availability и profile routes.
8. API tests.
