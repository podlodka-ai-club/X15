# orch — хакатонный агентный оркестратор

Тонкий Python state machine, который:

1. берёт Issue из GitHub (`gh` CLI) по label
2. через Planner-агента (`OpenAI Agents SDK`, модель через OpenRouter) превращает его в structured `ExecutionBrief`
3. создаёт изолированный `git worktree` и новую ветку
4. зовёт обёртку над `Cursor CLI` (`cursor-agent -p --force --output-format json`) чтобы реально поменять код
5. запускает quality gates (`ruff`, `pytest`)
6. если чек упал — Fixer-агент возвращает structured `RepairPlan`, оркестратор снова зовёт Cursor CLI
7. при успехе коммитит, пушит ветку и открывает PR через `gh`
8. всё пишет в JSONL-лог `runs/<run_id>.jsonl`

## Требования

- Python 3.11+
- `git`
- [`gh`](https://cli.github.com/) (`gh auth login`)
- [Cursor CLI](https://cursor.com/docs/cli/headless) (`cursor-agent --version`)
- ключ OpenRouter
- локальный клон целевого репозитория

## Установка

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env  # заполнить ключи и имя репозитория
```

## Быстрый старт

```bash
# 1) проверить конфиг и маскированные ключи
orch doctor

# 2) посмотреть, какие issue подцепятся
orch list-issues

# 3) прогнать один end-to-end run на первом issue с label agent-ready
orch run --repo-path /path/to/target/repo

# или на конкретном номере
orch run --repo-path /path/to/target/repo --issue 42
```

## Переменные окружения

См. `.env.example`. Ключевые:

| Переменная | Описание |
|---|---|
| `OPENROUTER_API_KEY` | ключ OpenRouter, через него Agents SDK зовёт модели |
| `ORCH_PLANNER_MODEL` / `ORCH_FIXER_MODEL` | slug модели OpenRouter (напр. `anthropic/claude-sonnet-4`) |
| `CURSOR_API_KEY` | ключ Cursor CLI для headless-запуска |
| `ORCH_GH_REPO` | `owner/repo` целевого репо |
| `ORCH_ISSUE_LABEL` | label, по которому orchestrator забирает задачи (по умолчанию `agent-ready`) |
| `ORCH_MAX_REPAIR_ATTEMPTS` | сколько раз пробовать починить провалившиеся checks |

## Архитектура

```
GitHub Issue
     │  gh issue view
     ▼
IssueIntake ──► Planner (Agents SDK / OpenRouter) ──► ExecutionBrief
                                                       │
                                                       ▼
                                                 git worktree
                                                       │
                                                       ▼
                                         CursorAgent (cursor-agent -p --force)
                                                       │
                                                       ▼
                                       QualityGates (ruff, pytest, ...)
                                           │             │
                                      pass │             │ fail
                                           │             ▼
                                           │     Fixer (Agents SDK) → RepairPlan
                                           │             │
                                           │             ▼
                                           │     CursorAgent (repair) ─┐
                                           │                           │
                                           │◄──────────────────────────┘
                                           ▼
                                    commit + push + gh pr create
                                           │
                                           ▼
                                        PR URL
```

Всё состояние потока — это обычный Python-код в `orch/orchestrator.py`. LLM отвечают только за локальные интеллектуальные решения (план, диагностика, правки).

## Логи

Каждый run пишет `runs/<run_id>.jsonl`. Одна строка — одно событие: `start`/`end`/`ok`/`fail` с таймингами и метаданными. Этого достаточно, чтобы на демо показать trace шагов.
