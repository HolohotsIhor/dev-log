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
