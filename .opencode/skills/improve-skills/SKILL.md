---
name: improve-skills
description: Использовать, когда пользователь просит улучшить skills, agents, AGENTS.md, prompts или AI workflow этого проекта Cal Booking.
---

# Improve Skills

Используй этот skill только для поддержки AI workflow files проекта:

- `AGENTS.md`
- `opencode.json`
- `.opencode/agents/*.md`
- `.opencode/skills/*/SKILL.md`
- workflow documentation в `docs/`

## Workflow

1. Сначала прочитать релевантные workflow files.
2. Найти устаревшие, дублирующиеся, расплывчатые или конфликтующие instructions.
3. Держать descriptions конкретными и triggerable.
4. Держать каждый skill scoped под одну задачу.
5. Сохранять frontmatter без изменений, если изменение не является намеренным.
6. Предпочитать маленькие edits вместо rewrites.
7. Не менять application code без явного запроса.

## Quality Checks

- Skill `name` совпадает с folder name.
- Skill `description` объясняет, когда его использовать.
- Agent `description` объясняет, когда его использовать.
- Instructions не конфликтуют с `AGENTS.md`.
- Security и Docker constraints сохранены.
- API-contract-first workflow сохранен.

## Safety Rules

- Не удалять instructions молча.
- Не делать skills self-modifying by default.
- Не добавлять слишком broad skills, которые срабатывают на несвязанные coding tasks.
- После изменения opencode config, agents или skills сказать пользователю перезапустить opencode.
