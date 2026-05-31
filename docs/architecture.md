# Архитектура Cal Booking

## Назначение

Cal Booking — компактное учебное приложение для записи на встречу. Проект нужен, чтобы отработать разработку с ИИ-агентами по contract-first процессу: сначала описываем поведение и API, затем реализуем сервер и UI, покрываем ключевые сценарии тестами и укрепляем Docker-деплой.

## Границы MVP

Входит в MVP:

- одна публичная страница записи;
- один владелец календаря;
- один публичный booking flow;
- категории встречи на 15 и 30 минут;
- вход администратора по email и паролю;
- список встреч в админке;
- настройки доступности;
- настройки публичного профиля;
- SQLite persistence;
- запуск через Docker Compose.

Не входит без явного запроса:

- внешние календарные интеграции;
- OAuth;
- публичная регистрация;
- платежи;
- команды;
- несколько типов встреч;
- email-доставка;
- ссылки для самостоятельного переноса встречи гостем.

## Стек

- React + Vite + TypeScript для браузерного UI в `apps/web`.
- NestJS + TypeScript для API-сервера в `apps/api`.
- SQLite + Drizzle ORM для хранения данных.
- Argon2 для хеширования паролей.
- HttpOnly cookie sessions для admin authentication.
- `class-validator` + `class-transformer` + NestJS `ValidationPipe` для DTO validation.
- Vitest для API/unit тестов.
- Playwright для e2e тестов.
- Docker Compose для локального и production-like runtime.

## Runtime-Схема

Production-контейнер остается один: NestJS отдает и API, и собранное React-приложение.

```txt
Browser / reverse proxy
  -> cal-booking-app:3000
    -> NestJS API
    -> static React build
    -> SQLite database file
```

Production Compose:

- service name: `cal-booking-app`;
- internal port: `3000`;
- host-порты не публикуются;
- health endpoint: `/api/health`;
- внешний reverse proxy может быть настроен отдельно, если нужен публичный доступ.

Для dev-проверки в браузере используется `docker-compose.dev.yml`, который bind-ит только `127.0.0.1:3000:3000`.

## Модель Данных

Кодовая структура разделена как npm workspaces:

```txt
apps/api   # NestJS API, database, auth, static serving
apps/web   # React/Vite frontend
```

В production запускается только `apps/api`; frontend предварительно собирается и копируется в runtime image как static assets.

### `admin_users`

- `id`
- `email`
- `passwordHash`
- `createdAt`
- `updatedAt`

### `sessions`

- `id`
- `userId`
- `tokenHash`
- `expiresAt`
- `createdAt`

### `calendar_profile`

- `id`
- `ownerName`
- `ownerTitle`
- `ownerBio`
- `avatarUrl`
- `meetingTitle`
- `meetingDescription`
- `meetingDurationMinutes`
- `timezone`
- `updatedAt`

### `availability_rules`

- `id`
- `weekday`
- `enabled`
- `startTime`
- `endTime`
- `updatedAt`

### `bookings`

- `id`
- `guestName`
- `guestEmail`
- `guestNotes`
- `startAt`
- `endAt`
- `status`
- `createdAt`
- `cancelledAt`

## Правила Бронирования

- Booking flow поддерживает длительность 15 или 30 минут.
- Сервер генерирует слоты из правил доступности.
- Сервер исключает прошедшие слоты.
- Сервер исключает слоты с активными confirmed bookings.
- Отмененные bookings освобождают слот.
- Double booking отклоняется на сервере и уровне базы/транзакции.
- Клиент не вычисляет итоговую доступность самостоятельно.

## Работа Со Временем

- Все timestamps хранятся в UTC.
- API возвращает ISO 8601 UTC strings.
- Browser отображает время в локальной timezone пользователя, пока не появится отдельное решение по выбору timezone.
- Availability rules используют локальное wall-clock time в timezone владельца календаря.

## Аутентификация

- Один admin account создается из environment variables.
- Пароль администратора хешируется через Argon2.
- Login создает случайный session token.
- В SQLite хранится только hash session token.
- Session token отправляется в HttpOnly cookie.
- Cookie использует SameSite=Lax.
- Cookie использует Secure в production.
- Logout удаляет server-side session и очищает cookie.

## Базовая Безопасность

- Валидировать внешний input через NestJS DTO и `ValidationPipe`.
- Закрывать admin routes через NestJS `SessionGuard`.
- Отклонять некорректные Host headers.
- Использовать базовые security headers.
- Не публиковать production container ports напрямую.
- Не подключаться к существующим Docker-сетям без явного разрешения.
- Хранить secrets в environment variables, а не в source files.

## UI-Направление

Публичная страница записи вдохновлена Cal.com, но не копирует его код:

- центрированная карточка;
- две колонки на desktop;
- детали встречи слева;
- календарь, слоты и форма записи справа;
- stacked layout на mobile;
- минимальная типографика и аккуратные borders;
- темные primary action buttons.

Админка использует тот же сдержанный стиль: простая навигация, таблицы, формы и понятные состояния.

## Этапы Реализации

1. AI workflow и docs.
2. API contract.
3. NestJS API foundation.
4. SQLite schema, migrations и seed data.
5. Authentication и session middleware.
6. Public profile, slots и bookings API.
7. Admin bookings, availability и profile API.
8. React public booking UI в `apps/web`.
9. React admin UI в `apps/web`.
10. API и e2e tests.
11. Укрепление production Docker build.
