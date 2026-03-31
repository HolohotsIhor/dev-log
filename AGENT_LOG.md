# Agent Log

An honest account of how an AI coding agent (Claude via Cursor) was used during development of DevLog.

---

## How I worked with the agent

The agent was used as an implementation accelerator, not as a decision-maker. All architectural decisions, feature scope, component design, and agent behavior were defined by me upfront. The AI then implemented those decisions.

The workflow was: I defined what to build and why → gave the agent a clear, scoped prompt → reviewed the output → accepted, adjusted, or rejected.

---

## What I decided, what the agent implemented

### Architecture and technology choices
I chose:
- Next.js App Router with Route Handlers — no separate backend process, one `npm run dev`
- `better-sqlite3` — this project is a single-user local tool; a file-based DB is the right fit, not a server database
- No ORM, no RTK Query — explicit SQL queries and plain `fetch` keep complexity proportional to the scope
- `zod` only at the API boundary — not spread through the codebase

I have created a clear implementation plan with a detailed description of the features. The agent implemented this structure once I described it.

### Feature scope
I defined which AI functions to build (decomposition + prioritization) and explicitly ruled out others (status update generator) to stay within the time budget. The agent did not decide what to build.

### AI agent design
I designed the multi-step behavior of both agents before asking the agent to implement them:

- **Decomposition**: assess clarity first → ask questions if needed → generate subtasks → optionally persist. This is my product decision — a single-step "just generate subtasks" would have been simpler to implement.
- **Prioritization**: local scoring without LLM first (deterministic, fast) → LLM reviews and explains in natural language. Separating scoring from explanation was a deliberate architectural choice I made to keep the LLM's role honest.

### Component structure
I defined the component breakdown (Badge, TaskCard, TaskForm, Filters, DecomposeModal, PrioritizePanel) and the state machine shapes for the modals before the agent wrote any UI code.

---

## What the agent generated

Once I defined the above, the agent wrote the implementation:

- All DB layer files (`client.ts`, `migrate.ts`, `taskRepo.ts`, `subtaskRepo.ts`)
- Zod schemas and API route handlers
- All React components and the main page
- LLM client with OpenAI / Anthropic / Mock factory
- Agent implementations following the multi-step flows I described

This saved significant time on boilerplate and kept the patterns consistent across files.

---

## Refactoring and structural decisions I made

### Component decomposition
I defined the component boundary strategy before any code was written. The key decision was to keep all page-level state in `page.tsx` and pass everything down via props — no context, no shared store. This makes data flow explicit and traceable: every state change goes through one place (`fetchTasks`, `setModal`). Components like `TaskCard`, `Filters`, and `Badge` are pure presentational — they receive data and emit callbacks, nothing more.

The modal state uses a discriminated union (`type Modal = { kind: 'create' } | { kind: 'edit'; task: Task } | ...`) rather than separate boolean flags. This eliminates impossible states at the type level — you can never have `editModal: true` and `task: undefined` at the same time.

### AI agent internal structure
Both agents follow the same pattern I outlined before writing them: local computation first, LLM second. In the decomposition agent, `assessClarity` and `generateSubtasks` are separate private functions with clear responsibilities — the public `runDecomposeAgent` orchestrates them. This made it straightforward to add the "skip assessment if answers provided" shortcut without touching the inner logic.

In the prioritization agent, the scoring formula (`scoreTask`) is deliberately kept local and deterministic — no LLM involved. The LLM's role is scoped to interpretation and explanation only. This separation means the feature works predictably even in mock mode, and the LLM's output can be validated against the local ranking.

### Data layer structure
I chose to keep the repos (`taskRepo`, `subtaskRepo`) as plain functions rather than classes or singletons. In a server context with SQLite this is simpler and avoids unnecessary state — the db connection is already a singleton at the module level. Each function takes only what it needs and returns a typed result.

## Where I intervened and corrected

**Subtask save bug.** The agent's initial implementation of "Save subtasks" re-ran the entire decomposition agent instead of persisting the already-generated list. I caught this during review and fixed it: the save path now sends the existing subtasks directly to the API, bypassing the agent.

**Mock mode placement.** An early version had the `LLM_MOCK` check duplicated in each agent. I consolidated it into the `getLLMClient` factory — agents stay clean, config lives in one place.

**Prompt robustness.** I added "Respond ONLY with valid JSON" to every LLM system prompt after knowing from experience that without it, models wrap JSON in markdown code fences and break `JSON.parse`.

---

## What was deliberately left out and why

- **Subtask display in UI** — subtasks are created and stored but not shown on the task list. Displaying them well (expandable cards, per-subtask status) would have pushed well beyond the time budget. I chose to ship the storage and AI creation correctly rather than add a half-finished UI.
- **Status update generator (feature C)** — the decomposition agent already demonstrates multi-step reasoning with a clarification loop. Adding a third agent would have diluted quality across all three.
- **Optimistic UI** — mutations refetch from the server. Correct over clever given the scope.
- **Migrations system** — `CREATE TABLE IF NOT EXISTS` is sufficient for a local single-user tool. A proper migration runner would be the first addition before any shared deployment.
- **Authentication** — not required per spec.
