<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions

- **Quotes**: single quotes everywhere, including JSX attributes — enforced by Prettier (`npx prettier --write "**/*.{ts,tsx}"`)
- **Semicolons**: omit unless required to disambiguate
- **Variables**: `const` over `let` wherever possible
- **Types**: explicit return types on all exported functions; no `any` — use `unknown` and narrow
- **Buttons**: always use `<Button variant='...'>` from `components/Button.tsx`, never raw `<button>` for UI actions
- **Duplicate Tailwind classes**: if a class string repeats within one file, extract it to a `const` above the component; don't create a shared styles file unless it's used across 3+ components
- **DB layer**: sorting and filtering belong in SQL (`ORDER BY`, `WHERE`), not in JavaScript after fetching
- **Dependencies**: no new packages without a strong reason — this project is intentionally minimal
- **Comments**: no decorative section dividers (`─── Section ───`), no comments that narrate what the code obviously does; only explain non-obvious intent or trade-offs

## LLM agents (`server/ai/`)

- One exported `run*` function per file; internal steps are private functions in the same file
- Always include `"Respond ONLY with valid JSON"` in the system prompt
- Always use `parseJSON()` from `server/ai/parseJSON.ts` to parse LLM responses — it strips markdown fences
- Always provide a fallback for unparseable output; a bad LLM response must never be an unhandled crash
- Deterministic logic first, LLM second — if something can be computed locally, do it before calling the LLM

## API routes (`app/api/`)

- Call `runMigrations()` at the top of every route module
- Use `NextRequest` / `NextResponse`, not the native `Request` / `Response`
- Validate input with Zod at the route level only — do not spread Zod into `server/`
- Route handler responsibility: parse request → call a `server/` function → return JSON; no business logic in the route itself

## UI state

- New modal flow: add a branch to the `Modal` discriminated union in `page.tsx` first
- Component state machines use discriminated unions (`{ kind: 'idle' } | { kind: 'loading' } | ...`), not boolean flags
- AI endpoint calls (`fetch('/api/ai/...')`) stay inside the component; tasks CRUD goes through `client/apiClient.ts`
