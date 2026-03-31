# DevLog

Task tracker for engineering teams with an embedded AI agent layer.

## Quick start

```bash
cp .env.example .env.local   # configure LLM (or leave LLM_MOCK=true)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No API key?** Set `LLM_MOCK=true` in `.env.local` — the app runs fully offline with deterministic mock responses.

## Architecture

Four layers, each knowing only about the one below:

```
components / app/page.tsx   — UI, React state
app/api/                    — HTTP layer: parse request, call lib, return JSON
lib/ai/                     — agent logic (LLM calls, multi-step flows)
lib/db/                     — data access (SQLite repositories)
```

API endpoints:
- `GET/POST /api/tasks` — list with filter/sort, create
- `GET/PATCH/DELETE /api/tasks/:id` — single task
- `POST /api/ai/decompose` — decomposition agent
- `POST /api/ai/prioritize` — prioritization agent

**Architecture decision: monolith**

A deliberate choice for this scope. A single Next.js app covers both frontend and backend — one repo, one `npm install && npm run dev`, zero infrastructure. Splitting into a separate API service would add deployment complexity with no real benefit for a single-user local tool.

**Tech choices:**
- **Next.js App Router** with Route Handlers — API routes live alongside the UI, no separate backend process
- **better-sqlite3** — file-based persistence, zero config, works offline; no ORM to keep queries explicit
- **Zod** — schema validation at the API boundary only, not spread through the codebase
- No RTK Query / Redux — plain `fetch` + React state is sufficient for this scope

## Data storage

Tasks are stored in `data/devlog.db` (SQLite, WAL mode). The file is created automatically on first request.

**Known limitations:**
- Single-user, single-process — SQLite's concurrency model is not suitable for multi-instance deployments
- No migrations system — schema is applied via `CREATE TABLE IF NOT EXISTS` on startup
- `data/` is `.gitignore`-ed, so the database is local only

## AI agents

### Decomposition agent (`/api/ai/decompose`)

Multi-step flow:

1. **Assess clarity** — LLM decides if the task description is specific enough. Returns `needsClarification + questions[]`
2. **Clarify** (optional) — if ambiguous, questions are shown in UI; user answers before proceeding
3. **Generate subtasks** — LLM produces 3–7 structured, ordered subtasks as strict JSON
4. **Persist** (optional) — `save: true` in the request body creates subtasks in the DB via `bulkCreateSubtasks`

### Prioritization agent (`/api/ai/prioritize`)

Multi-step flow:

1. **Local scoring** (no LLM) — deterministic score per task: `priority_weight + age_days (capped 30) + in_progress_bonus`; `done` tasks excluded
2. **LLM review** — ranked list is sent to the LLM, which may reorder for logical dependencies and writes a 2–4 sentence "plan for the day"
3. **Merge** — final list uses LLM order; any tasks the LLM dropped are appended from the local ranking

### LLM client

Configured via environment variables. Supports OpenAI and Anthropic. Mock mode returns deterministic fixtures without any API calls.

## Environment variables

See `.env.example` for all variables. Copy to `.env.local` to configure locally.

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | `openai` or `anthropic` |
| `LLM_API_KEY` | Your API key |
| `LLM_MOCK` | `true` to skip real API calls |
| `LLM_MODEL` | Model name (e.g. `gpt-4o`, `claude-3-5-sonnet-20241022`) |
