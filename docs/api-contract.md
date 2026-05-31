# API-Контракт Cal Booking

## Общие Правила

Production base URL зависит от окружения деплоя:

```txt
https://your-domain.example
```

Local development URL для локальной разработки:

```txt
http://127.0.0.1:3000
```

Все API-ответы используют JSON, если явно не указано иное.

Timestamps возвращаются как ISO 8601 UTC strings, например:

```txt
2026-06-01T09:00:00.000Z
```

## Формат Ошибки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

`details` может отсутствовать, если нет field-level деталей.

## Публичные Endpoints

### `GET /api/health`

Возвращает состояние сервиса для Docker healthcheck и uptime checks.

Ответ `200`:

```json
{
  "status": "ok"
}
```

### `GET /api/public/profile`

Возвращает публичный профиль владельца календаря и встречи.

Ответ `200`:

```json
{
  "profile": {
    "ownerName": "Алексей Иванов",
    "ownerTitle": "Продуктовый инженер",
    "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
    "avatarUrl": null,
    "meetingTitle": "Ознакомительный звонок",
    "meetingDescription": "30-минутный звонок, чтобы обсудить ваш запрос.",
    "meetingDurationMinutes": 30,
    "timezone": "Europe/Moscow"
  }
}
```

### `GET /api/public/slots?from=YYYY-MM-DD&to=YYYY-MM-DD&durationMinutes=15|30`

Возвращает доступные слоты за диапазон дат.

Правила:

- `from` и `to` обязательны и передаются как ISO date strings;
- `durationMinutes` опционален, допустимые значения `15` или `30`;
- максимальный диапазон — 31 день;
- response не содержит прошедшие слоты;
- response не содержит слоты с confirmed bookings;
- слоты генерируются на сервере из availability rules.

Ответ `200`:

```json
{
  "slots": [
    {
      "startAt": "2026-06-01T09:00:00.000Z",
      "endAt": "2026-06-01T09:30:00.000Z"
    }
  ]
}
```

Ошибки:

- `400 VALIDATION_ERROR` для некорректного или отсутствующего date range.

### `POST /api/public/bookings`

Создает публичную запись на встречу.

Запрос:

```json
{
  "startAt": "2026-06-01T09:00:00.000Z",
  "durationMinutes": 30,
  "guestName": "Мария Петрова",
  "guestEmail": "maria@example.com",
  "guestNotes": "Хочу обсудить проект."
}
```

Валидация:

- `startAt` обязателен и должен быть валидным будущим слотом;
- `durationMinutes` опционален, допустимые значения `15` или `30`;
- `guestName` обязателен;
- `guestEmail` обязателен и должен быть валидным email;
- `guestNotes` опционален.

Ответ `201`:

```json
{
  "booking": {
    "id": "booking_123",
    "guestName": "Мария Петрова",
    "guestEmail": "maria@example.com",
    "guestNotes": "Хочу обсудить проект.",
    "startAt": "2026-06-01T09:00:00.000Z",
    "endAt": "2026-06-01T09:30:00.000Z",
    "status": "confirmed",
    "createdAt": "2026-05-30T12:00:00.000Z"
  }
}
```

Ошибки:

- `400 VALIDATION_ERROR` для некорректного input;
- `409 SLOT_UNAVAILABLE`, если слот недоступен или уже занят.

### `GET /api/public/bookings/:id`

Возвращает данные бронирования для success page.

Ответ `200`:

```json
{
  "booking": {
    "id": "booking_123",
    "guestName": "Мария Петрова",
    "guestEmail": "maria@example.com",
    "guestNotes": "Хочу обсудить проект.",
    "startAt": "2026-06-01T09:00:00.000Z",
    "endAt": "2026-06-01T09:30:00.000Z",
    "status": "confirmed"
  },
  "profile": {
    "ownerName": "Алексей Иванов",
    "meetingTitle": "Ознакомительный звонок",
    "meetingDurationMinutes": 30,
    "timezone": "Europe/Moscow"
  }
}
```

Ошибки:

- `404 NOT_FOUND`, если booking не найден.

## Endpoints Аутентификации

### `POST /api/auth/login`

Авторизует администратора и устанавливает HttpOnly session cookie.

Запрос:

```json
{
  "email": "admin@example.com",
  "password": "change-me-now",
  "rememberMe": false
}
```

`rememberMe` опционален. При `true` сервер выдает более долгую HttpOnly session cookie. Пароль в браузере не сохраняется.

Ответ `200`:

```json
{
  "user": {
    "email": "admin@example.com"
  }
}
```

Ошибки:

- `400 VALIDATION_ERROR` для некорректного input;
- `401 INVALID_CREDENTIALS` для неверного email или password.

### `POST /api/auth/logout`

Удаляет текущую session и очищает cookie.

Ответ `204`: пустое тело ответа.

### `GET /api/auth/me`

Возвращает текущего admin user.

Ответ `200`:

```json
{
  "user": {
    "email": "admin@example.com"
  }
}
```

Ошибки:

- `401 UNAUTHENTICATED`, если валидной session нет.

## Админские Endpoints

Все `/api/admin/*` endpoints требуют валидную admin session.

### `GET /api/admin/bookings?status=upcoming|past|cancelled|all`

Возвращает bookings для admin list.

Ответ `200`:

```json
{
  "bookings": [
    {
      "id": "booking_123",
      "guestName": "Мария Петрова",
      "guestEmail": "maria@example.com",
      "guestNotes": "Хочу обсудить проект.",
      "startAt": "2026-06-01T09:00:00.000Z",
      "endAt": "2026-06-01T09:30:00.000Z",
      "status": "confirmed",
      "createdAt": "2026-05-30T12:00:00.000Z",
      "cancelledAt": null
    }
  ]
}
```

### `PATCH /api/admin/bookings/:id/cancel`

Отменяет booking.

Ответ `200`:

```json
{
  "booking": {
    "id": "booking_123",
    "status": "cancelled",
    "cancelledAt": "2026-05-30T12:30:00.000Z"
  }
}
```

Ошибки:

- `404 NOT_FOUND`, если booking не найден.

### `GET /api/admin/availability`

Возвращает weekly availability rules.

Ответ `200`:

```json
{
  "availability": [
    {
      "weekday": 1,
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

`weekday` использует ISO numbering: понедельник — `1`, воскресенье — `7`.

### `PUT /api/admin/availability`

Полностью заменяет weekly availability rules.

Запрос:

```json
{
  "availability": [
    {
      "weekday": 1,
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

Валидация:

- требуется ровно 7 правил, по одному на каждый weekday;
- `weekday` от 1 до 7;
- `startTime` и `endTime` в формате `HH:mm`;
- `startTime` раньше `endTime`, если rule включен.

Ответ `200`:

```json
{
  "availability": [
    {
      "weekday": 1,
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

### `GET /api/admin/profile`

Возвращает редактируемые настройки публичного профиля.

Ответ `200`:

```json
{
  "profile": {
    "ownerName": "Алексей Иванов",
    "ownerTitle": "Продуктовый инженер",
    "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
    "avatarUrl": null,
    "meetingTitle": "Ознакомительный звонок",
    "meetingDescription": "30-минутный звонок, чтобы обсудить ваш запрос.",
    "meetingDurationMinutes": 30,
    "timezone": "Europe/Moscow"
  }
}
```

### `PUT /api/admin/profile`

Обновляет настройки публичного профиля.

Запрос:

```json
{
  "ownerName": "Алексей Иванов",
  "ownerTitle": "Продуктовый инженер",
  "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
  "avatarUrl": null,
  "meetingTitle": "Ознакомительный звонок",
  "meetingDescription": "30-минутный звонок, чтобы обсудить ваш запрос.",
  "meetingDurationMinutes": 30,
  "timezone": "Europe/Moscow"
}
```

Ответ `200`:

```json
{
  "profile": {
    "ownerName": "Алексей Иванов",
    "ownerTitle": "Продуктовый инженер",
    "ownerBio": "Запишитесь на короткий ознакомительный звонок.",
    "avatarUrl": null,
    "meetingTitle": "Ознакомительный звонок",
    "meetingDescription": "30-минутный звонок, чтобы обсудить ваш запрос.",
    "meetingDurationMinutes": 30,
    "timezone": "Europe/Moscow"
  }
}
```

## Коды Статусов

- `200 OK` успешное чтение или обновление.
- `201 Created` booking создан.
- `204 No Content` logout успешен.
- `400 Bad Request` ошибка валидации.
- `401 Unauthorized` отсутствует или невалидна session.
- `404 Not Found` resource не найден.
- `409 Conflict` booking slot недоступен.
- `500 Internal Server Error` непредвиденная server error.
