---
name: e2e-testing
description: Использовать при добавлении или review Vitest и Playwright tests для Cal Booking user flows и regressions.
---

# E2E Testing

Используй этот skill для test planning и implementation.

## Critical Scenarios

- Visitor открывает booking page.
- Visitor выбирает 15- или 30-minute meeting category.
- Visitor выбирает дату и доступный slot.
- Visitor отправляет name, email и notes.
- Booking success page показывает выбранную встречу.
- Booked slot больше не доступен.
- Admin входит по email и password.
- Admin видит новый booking.
- Admin отменяет booking.
- Cancelled slot снова становится доступным.
- Availability changes влияют на public slots.

## Test Rules

- Предпочитать deterministic seeded data.
- По возможности не зависеть от текущего wall clock.
- Сбрасывать database state между tests.
- Использовать API setup helpers для authenticated admin state, когда это уместно.
- Держать visual assertions минимальными и осмысленными.

Добавляй tests для security-sensitive behavior: invalid login, anonymous admin access и double-booking rejection.
