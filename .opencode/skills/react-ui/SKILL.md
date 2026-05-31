---
name: react-ui
description: Использовать при создании Cal Booking React pages, booking flow, admin UI, responsive layout и Cal.com-inspired interface.
---

# React UI

Используй этот skill для frontend implementation tasks в `apps/web`.

## Visual Direction

- Минимальный светлый layout, вдохновленный Cal.com, без копирования кода.
- Centered booking card на нейтральном фоне.
- Desktop booking page в две колонки: event details слева, calendar/slots/form справа.
- Mobile layout складывает sections вертикально.
- Использовать понятную typography, сдержанные borders и dark primary actions.

## Behavior Rules

- Загружать slots из API; не вычислять availability на client.
- Делать form validation дружелюбной, но финальную validation оставлять серверу.
- Обрабатывать loading, error, empty и success states.
- Защищать admin pages через проверку `/api/auth/me`.
- Конвертировать UTC timestamps только на границе отображения.

## Pages

- `/` public booking page.
- `/success/:bookingId` booking confirmation.
- `/login` admin login.
- `/admin` booking list.
- `/admin/availability` availability settings.
- `/admin/profile` public profile settings.

## Structure

- Держать route-level components в `apps/web/src/pages`.
- Держать booking flow pieces в `apps/web/src/features/booking`.
- Держать admin layout pieces в `apps/web/src/features/admin`.
- Держать API client и types в `apps/web/src/api`.
