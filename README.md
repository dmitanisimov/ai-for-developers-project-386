# Cal Booking

Учебное production-like приложение для записи на звонок по мотивам Cal.com. Проект показывает полный цикл разработки с ИИ-агентами: Design First, API-контракт, раздельные frontend/backend приложения, тесты и Docker runtime.

## Что Умеет Приложение

- Публичная страница записи.
- Выбор встречи на 15 или 30 минут.
- Просмотр свободных и занятых слотов.
- Создание бронирования гостем без авторизации.
- Вход администратора по email и паролю.
- Просмотр и отмена встреч в админке.
- Настройка доступности владельца календаря.
- Настройка публичного профиля.

## Учебный Подход

Проект следует Design First подходу:

1. Сначала фиксируется API-контракт в `docs/api-contract.md`.
2. Frontend и backend реализуются отдельно по контракту.
3. Tests проверяют критические сценарии и соответствие реализации контракту.
4. Docker image собирает приложение в один production-like runtime.

Исходное учебное задание не требует авторизации. В этой реализации admin-auth оставлен как production-like расширение, чтобы владелец календаря мог безопасно управлять встречами и настройками.

## Стек

- React + Vite + TypeScript в `apps/web`.
- NestJS + TypeScript в `apps/api`.
- SQLite + Drizzle ORM.
- Argon2 для пароля администратора.
- HttpOnly cookie sessions.
- `class-validator` + `class-transformer` + NestJS `ValidationPipe`.
- Vitest + Supertest для API tests.
- Playwright для browser e2e tests.
- Docker Compose для контейнерного запуска.

## Структура

```txt
apps/api   # NestJS API, database, auth, static serving
apps/web   # React/Vite frontend
docs       # architecture, API contract, workflow notes
```

В production-like режиме запускается один контейнер: NestJS отдает `/api/*` и собранный React build.

## Документация

- `docs/api-contract.md` — контракт API.
- `docs/architecture.md` — архитектура и границы MVP.
- `docs/assignment-adaptation.md` — как проект адаптирует учебное задание.
- `docs/cal-com-research.md` — наблюдения по Cal.com и предметной области.
- `docs/ai-workflow.md` — workflow с ИИ-агентами.
- `AGENTS.md` — правила для ИИ-разработки в проекте.

## Локальный Запуск

Установить зависимости:

```bash
npm install
```

Проверить TypeScript:

```bash
npm run typecheck
```

Запустить API tests:

```bash
npm test
```

Собрать приложение:

```bash
npm run build
```

Запустить production build локально:

```bash
npm start
```

После запуска доступны:

```txt
http://127.0.0.1:3000
http://127.0.0.1:3000/book
http://127.0.0.1:3000/api/health
```

## Dev Credentials

Для локальной разработки и dev Docker override используются:

```txt
admin@example.com
local-dev-password
```

## Browser E2E

Запустить Playwright tests:

```bash
npm run e2e
```

Если Playwright запускается впервые на машине, установи браузер и системные зависимости:

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

`npm run e2e` собирает `apps/web` и `apps/api`, стартует NestJS на временной SQLite базе и проверяет основной booking/admin flow.

## Docker

Создать `.env` при необходимости:

```bash
cp .env.example .env
```

Для production-like запуска задай собственные значения:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-to-a-long-password
SESSION_SECRET=change-me-to-a-long-random-secret
```

Собрать и запустить контейнер без публикации host-порта:

```bash
docker compose up -d --build
```

Для локальной проверки в браузере используй dev override, который публикует порт только на `127.0.0.1`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Открыть:

```txt
http://127.0.0.1:3000
```

Остановить:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Environment Variables

```env
APP_HOST=localhost
APP_PORT=3000
NODE_ENV=production
DATABASE_URL=file:/app/data/cal-booking.sqlite
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-to-a-long-password
SESSION_SECRET=change-me-to-a-long-random-secret
SESSION_COOKIE_NAME=cal_booking_session
```

SQLite база в Docker хранится в volume `cal-booking-data` и монтируется в `/app/data`.

## Healthcheck

```txt
GET /api/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

## Проверка Перед Commit

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
docker compose config
docker compose -f docker-compose.yml -f docker-compose.dev.yml config
```
