# AI Workflow

Этот проект намеренно разрабатывается с помощью ИИ-агентов, project skills, MCP tools и VSCode workflow.

## Файлы

- `AGENTS.md` содержит общие правила проекта.
- `opencode.json` подключает project instructions и skills.
- `.opencode/agents/*.md` определяет специализированных markdown-агентов.
- `.opencode/skills/*/SKILL.md` определяет переиспользуемые workflows.
- `docs/architecture.md` фиксирует архитектурные решения.
- `typespec/main.tsp` фиксирует контракт между client и server.
- `docs/openapi.yaml` генерируется из TypeSpec и не редактируется вручную.

## Роли Агентов

- `architect`: scope, contract, architecture, tradeoffs.
- `backend`: NestJS, SQLite, Drizzle, auth guards, sessions, booking rules.
- `frontend`: React UI, booking flow, admin pages.
- `tester`: Vitest, Playwright, regression coverage.
- `reviewer`: bug-focused review и security checks.
- `devops`: Docker, health checks, deployment readiness.
- `skill-curator`: улучшает project agents, skills и workflow docs.

## Skills

- `improve-skills`: улучшает workflow files и инструкции агентов.
- `api-contract`: помогает проектировать и проверять API behavior.
- `backend-api`: помогает с server implementation.
- `react-ui`: помогает с UI implementation.
- `e2e-testing`: помогает с API и browser test coverage.

## MCP

В `opencode.json` есть отключенная заготовка Playwright MCP server:

```json
"mcp": {
  "playwright": {
    "type": "local",
    "command": ["npx", "-y", "@playwright/mcp"],
    "enabled": false
  }
}
```

Она отключена по умолчанию, чтобы не ломать запуск до момента, когда проекту действительно понадобится browser automation. Включим позже, когда начнем UI-тестирование.

GitHub MCP пока не настроен, потому что для него нужны решения по token и repository.

## VSCode Workflow

Рекомендуемый порядок работы в VSCode:

- редактировать код только внутри этой project folder;
- для browser checks использовать dev compose override;
- держать API contract открытым во время реализации frontend/backend;
- использовать npm workspaces: `apps/api` для NestJS и `apps/web` для React/Vite;
- держать production runtime одним Docker-сервисом `cal-booking-app`.

Dev-проверка production-like сборки через браузер:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Browser e2e проверка через Playwright:

```bash
npm run e2e
```

E2E стартует собранный NestJS runtime на временной SQLite базе и проверяет публичный booking flow вместе с admin cancellation flow.

Production-like internal mode:

```bash
docker compose up -d --build
```

## Рабочее Правило

Когда появляется новая feature, сначала определить, меняется ли `typespec/main.tsp`. Если меняется, обновить TypeSpec и сгенерировать OpenAPI до реализации или в том же patch.

После изменения `opencode.json`, `.opencode/agents` или `.opencode/skills` нужно перезапустить opencode, чтобы текущая сессия загрузила новые файлы.
