# Руководство Для ИИ-Разработки Cal Booking

## Цель Проекта

Cal Booking — учебный проект по разработке с помощью ИИ. Продукт представляет собой небольшое приложение для записи на 30-минутную встречу: посетитель бронирует свободный слот, а администратор управляет доступностью, публичным профилем и списком встреч.

Цель урока — отработать разработку с ИИ-агентами, project skills, MCP, VSCode workflow, contract-first подход, тестирование, Docker и подготовку к деплою.

## Границы MVP

Строим компактный production-like MVP:

- публичная страница записи;
- вход администратора по email и паролю;
- список записей в админке;
- настройки доступности администратора;
- настройки публичного профиля;
- SQLite persistence;
- Docker Compose deployment.

Не добавлять внешние календарные интеграции, платежи, команды, OAuth, публичную регистрацию или email-доставку без явного запроса.

## Предпочтительный Стек

- React + Vite + TypeScript для web UI в `apps/web`.
- NestJS + TypeScript для API-сервера в `apps/api`.
- SQLite + Drizzle ORM для хранения данных.
- Argon2 для хеширования паролей.
- HttpOnly cookie sessions для admin-auth.
- `class-validator` + `class-transformer` + глобальный NestJS `ValidationPipe` для валидации запросов.
- Vitest для API/unit тестов.
- Playwright для end-to-end тестов.
- Docker Compose для runtime.

## Архитектурные Правила

- Держать API-контракт в `typespec/main.tsp`, `docs/openapi.yaml` и `docs/api-contract.md` синхронизированным с реализацией.
- Доступные слоты вычисляет сервер; клиент не должен самостоятельно реализовывать правила доступности.
- Хранить timestamps в UTC. Конвертировать только на границе отображения.
- Для MVP оставить одного владельца календаря и несколько типов событий без команд/мультиаккаунтов.
- Публичный booking flow остается без авторизации.
- Все `/api/admin/*` endpoints защищать NestJS session guard.
- Admin routes недоступны анонимным пользователям.
- Frontend и backend держать раздельно как npm workspaces: `apps/web` и `apps/api`.
- Production runtime остается одним Docker-сервисом: NestJS отдает `/api/*` и собранный React build.
- Предпочитать маленькие прямые реализации вместо generic abstractions.

## Правила Безопасности

- Никогда не хранить plaintext passwords.
- Хешировать admin passwords через Argon2.
- В базе хранить только hash session token.
- Использовать HttpOnly cookies для sessions.
- В production использовать Secure cookies.
- Использовать `SameSite=Lax`, пока нет конкретного cross-site сценария.
- Валидировать весь внешний input через NestJS DTO и `ValidationPipe`.
- Отклонять double booking на уровне сервера/базы.
- В production Docker Compose не публиковать host-порты.
- Не подключать проект к существующим Docker-сетям без явного разрешения.

## Docker Правила

- Приложение слушает `0.0.0.0:${PORT:-3000}` внутри контейнера.
- Production compose service называется `cal-booking-app`.
- Production compose file не использует `ports`.
- Локальные проверки через браузер используют `docker-compose.dev.yml`, который bind-ит только `127.0.0.1`.

## AI Workflow

Использовать специализированных агентов, когда задачу полезно разделить по ролям:

- `architect`: product scope, API contract, architecture tradeoffs.
- `backend`: NestJS, SQLite, Drizzle, auth guards, sessions, booking rules.
- `frontend`: React UI, booking flow, admin UI, responsive layout.
- `tester`: API tests, e2e tests, regression scenarios.
- `reviewer`: bug-focused review, security risks, contract mismatches.
- `devops`: Docker, environment, deployment, health checks.
- `skill-curator`: улучшает project agents и skills.

Перед реализацией feature определить, меняется ли API contract. Если меняется, обновить docs до реализации или в том же patch.

## Порядок Разработки

1. Поддерживать AI workflow files и architecture docs.
2. Поддерживать API contract.
3. Собрать NestJS API foundation.
4. Добавить persistence и seed data.
5. Добавить authentication.
6. Добавить public booking API.
7. Добавить admin API.
8. Собрать React UI в `apps/web` по страницам и features.
9. Добавить API и e2e tests.
10. Укрепить production Docker build.

## Review Checklist

- Соответствует ли изменение API contract?
- Валидируется ли input?
- Требуется ли authentication там, где она должна быть?
- Можно ли забронировать уже занятый slot?
- Последовательно ли обрабатываются timestamps?
- Docker по-прежнему не публикует production ports?
- Приложение по-прежнему exposes `/api/health`?
- Документированы ли tests или manual verification steps?
