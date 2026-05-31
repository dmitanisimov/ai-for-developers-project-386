---
name: api-contract
description: Использовать при проектировании, изменении или review Cal Booking API endpoints, request/response shapes, errors и contract docs.
---

# API Contract

Используй этот skill до реализации или изменения API behavior.

## Rules

- Держать `docs/api-contract.md` синхронизированным с implementation.
- Public booking endpoints остаются без authentication.
- Все `/api/admin/*` endpoints требуют valid admin session.
- Slots вычисляются сервером, а не client.
- Timestamps — ISO 8601 UTC strings.
- Ошибки валидации возвращают стабильные JSON shapes.
- Double booking должен отклоняться сервером.

## Checklist

- Endpoint относится к public, auth или admin scope?
- Какая authentication требуется?
- Какая NestJS DTO validation нужна?
- Какие status codes возможны?
- На какой response shape опирается frontend?
- Нужно ли добавить tests?

Обновляй docs в том же patch, что и implementation, если behavior меняется.
