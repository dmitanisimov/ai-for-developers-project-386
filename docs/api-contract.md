# API-Контракт Cal Booking

Канонический контракт описан в TypeSpec:

```txt
typespec/main.tsp
```

OpenAPI генерируется командой:

```bash
npm run spec:emit
```

Сгенерированный файл:

```txt
docs/openapi.yaml
```

Этот Markdown-файл остается человекочитаемой сводкой поведения API.

## Общие Правила

- Public booking flow не требует авторизации.
- Владелец календаря один и заранее задан seed-данными.
- Типы событий задают `id`, `title`, `description`, `durationMinutes`.
- Слоты вычисляет backend.
- Доступное окно записи: 14 календарных дней, начиная с текущей даты.
- Гость может создать booking только на свободный слот из 14-дневного окна.
- На одно и то же время нельзя создать две confirmed записи, даже если это разные типы событий.
- Timestamps возвращаются как ISO 8601 UTC strings.
- Admin-auth и `/api/admin/*` endpoints являются production-like расширением учебного задания.

## Формат Ошибки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректный запрос"
  }
}
```

## Public API

### `GET /api/health`

Ответ `200`:

```json
{"status":"ok"}
```

### `GET /api/public/owner`

Возвращает публичные данные владельца календаря.

Ответ `200`:

```json
{
  "owner": {
    "ownerName": "Алексей Иванов",
    "ownerTitle": "Продуктовый инженер",
    "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
    "avatarUrl": null,
    "timezone": "Europe/Moscow"
  }
}
```

### `GET /api/public/event-types`

Возвращает доступные типы событий.

Ответ `200`:

```json
{
  "eventTypes": [
    {
      "id": "intro-15",
      "title": "Короткая консультация",
      "description": "15 минут, чтобы быстро обсудить вопрос и договориться о следующих шагах.",
      "durationMinutes": 15
    }
  ]
}
```

### `GET /api/public/event-types/:eventTypeId/slots?includeStatus=true`

Возвращает слоты для выбранного типа события в ближайшие 14 дней.

Ответ `200`:

```json
{
  "slots": [
    {
      "startAt": "2026-06-01T09:00:00.000Z",
      "endAt": "2026-06-01T09:30:00.000Z",
      "status": "available"
    }
  ]
}
```

Ошибки:

- `404 NOT_FOUND`, если тип события не найден.

### `POST /api/public/bookings`

Создает публичное бронирование.

Запрос:

```json
{
  "eventTypeId": "intro-30",
  "startAt": "2026-06-01T09:00:00.000Z",
  "guestName": "Мария Петрова",
  "guestEmail": "maria@example.com",
  "guestNotes": "Хочу обсудить проект."
}
```

Ответ `201`:

```json
{
  "booking": {
    "id": "booking_123",
    "eventTypeId": "intro-30",
    "eventType": {
      "id": "intro-30",
      "title": "Ознакомительный звонок",
      "description": "30 минут, чтобы подробно обсудить проект, контекст и формат работы.",
      "durationMinutes": 30
    },
    "guestName": "Мария Петрова",
    "guestEmail": "maria@example.com",
    "guestNotes": "Хочу обсудить проект.",
    "startAt": "2026-06-01T09:00:00.000Z",
    "endAt": "2026-06-01T09:30:00.000Z",
    "status": "confirmed",
    "createdAt": "2026-05-31T12:00:00.000Z"
  }
}
```

Ошибки:

- `400 VALIDATION_ERROR` для некорректного input.
- `400 SLOT_OUT_OF_WINDOW`, если слот вне 14-дневного окна.
- `404 NOT_FOUND`, если тип события не найден.
- `409 SLOT_UNAVAILABLE`, если слот занят или недоступен.

### `GET /api/public/bookings/:id`

Возвращает confirmation данные.

Ответ `200`:

```json
{
  "booking": {
    "id": "booking_123",
    "eventTypeId": "intro-30",
    "eventType": {
      "id": "intro-30",
      "title": "Ознакомительный звонок",
      "description": "30 минут, чтобы подробно обсудить проект, контекст и формат работы.",
      "durationMinutes": 30
    },
    "guestName": "Мария Петрова",
    "guestEmail": "maria@example.com",
    "guestNotes": null,
    "startAt": "2026-06-01T09:00:00.000Z",
    "endAt": "2026-06-01T09:30:00.000Z",
    "status": "confirmed"
  },
  "owner": {
    "ownerName": "Алексей Иванов",
    "ownerTitle": "Продуктовый инженер",
    "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
    "avatarUrl": null,
    "timezone": "Europe/Moscow"
  }
}
```

## Auth Extension

Админка защищена HttpOnly cookie session.

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Admin Extension

Все `/api/admin/*` endpoints требуют valid admin session.

- `GET /api/admin/bookings?status=upcoming|past|cancelled|all`
- `PATCH /api/admin/bookings/:id/cancel`
- `GET /api/admin/event-types`
- `POST /api/admin/event-types`
- `GET /api/admin/availability`
- `PUT /api/admin/availability`
- `GET /api/admin/profile`
- `PUT /api/admin/profile`

Admin endpoints расширяют минимальное задание: они позволяют владельцу безопасно управлять встречами, доступностью, публичным профилем и типами событий.
