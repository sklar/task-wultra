# React Developer Assignment

A small dashboard SPA visualising devices paired against a mock authentication backend —
3–4 pages of tables and charts over real network calls, loading/error/offline states, and a
persisted user preference. See the brief in [ASSIGNMENT.md](ASSIGNMENT.md).

- [Tech stack](docs/TECH_STACK.md) — locked decisions
- [Justification](JUSTIFICATION.md) — the *why*, alternatives considered, and tradeoffs accepted

## 🧰 Stack

- [Vite 8](https://vite.dev/) (Rolldown bundler) — dev server + build
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — SPA UI, typechecked via `tsc`
- [TanStack Router](https://tanstack.com/router) — routing; filter/sort/pagination in typed URL search params
- [TanStack Query](https://tanstack.com/query) v5 — fetching, caching, loading/error/offline states
- [Tailwind CSS v4](https://tailwindcss.com/) + CSS variables — dark theme, `#09f` accent
- [UnoVis](https://unovis.dev/) — charts (donut, bars, daily activation bar)
- [Biome](https://biomejs.dev/) — lint + format (replaces ESLint + Prettier)
- [Vitest](https://vitest.dev/) + Testing Library + [MSW](https://mswjs.io/) v2 — tests & network mocking

## 🚀 How to run locally

**Prerequisites:** Node `24.16.0`, pnpm `11.6.0`.

```sh
nvm use            # or otherwise select Node 24.16.0
corepack enable    # activates the pnpm version pinned in package.json
pnpm install
pnpm dev           # dev server at http://localhost:5173
```

## 🧑‍🚀 Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start Vite dev server at `localhost:5173` |
| `pnpm build` | Typecheck (`tsc -b`) then build to `./dist/` |
| `pnpm preview` | Preview the production build |
| `pnpm lint:check` | Check with Biome |
| `pnpm lint:write` | Fix with Biome |
| `pnpm test` | Run tests in watch mode (Vitest) |
| `pnpm test:run` | Run tests once |
| `pnpm typecheck` | Typecheck without emitting |

## 🔌 Data source

[Wultra mock API](https://wultra.github.io/mtoken-tools/react-demo-api/) — static JSON on GitHub
Pages: `statistics.json`, `devices/index.json` (the full 120-device collection),
`devices/{id}.json`. The `page-N.json` and `users/*` endpoints are deliberately unused. MSW
mirrors the used endpoints to demo loading/error/offline states and to back the tests — not for
rate-limit avoidance (static hosting has none).

## 🧭 Technical decisions & next steps

Decisions favour a small codebase with explicit boundaries: no state-management library
(server state in Query, URL state in the router, and prefs in localStorage via one small
Context cover it), hand-rolled tables to avoid heavy dependencies, and Biome as a single
lint+format tool. Full reasoning in [JUSTIFICATION.md](JUSTIFICATION.md).

**With more time:** add a single Playwright happy-path smoke test — the one gap the Vitest + MSW
suite can't cover (jsdom isn't a real browser), currently out of scope.
