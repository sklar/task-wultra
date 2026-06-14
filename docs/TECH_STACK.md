# Tech Stack

Handoff reference for the build. Each entry is a locked decision; the *why* and the
considered alternatives live in [JUSTIFICATION.md](../JUSTIFICATION.md).

## Core

| Concern | Choice | Role |
|---|---|---|
| Build tool / bundler | **Vite 8** (Rolldown) | Dev server + production build. Rolldown is Vite 8's default bundler — no opt-in needed. |
| Framework | **React** | Single-page app UI. |
| Language | **TypeScript** | Type-checked via `tsc --noEmit` as a dedicated script and in CI (Vite/Oxc handles transforms). |

## App architecture

| Concern | Choice | Role |
|---|---|---|
| Routing | **TanStack Router** | 3–4 pages. Filter / sort / pagination state lives in **typed URL search params** (`validateSearch`). |
| Server state / networking | **TanStack Query** (v5) | Fetching, caching, loading & error states, offline handling (`networkMode: 'online'` → paused queries, auto-resume on reconnect). Devices load as one collection (`devices/index.json`); table sort/filter/pagination is client-side (see [ADR-0002](adr/0002-load-all-devices-client-side-table.md)). |
| Global client state | **One small Context** (no Redux / Zustand) | Deliberate. State = server state (Query) + URL state (Router) + persisted prefs (localStorage). The only app-wide client state is user prefs, carried by a single `PreferencesProvider` Context — not a store library ([ADR-0003](adr/0003-preferences-via-one-context-no-store-library.md)). |
| Persistence | **localStorage** | User preferences only: theme, table page size, timestamp format. Filters / sort / page stay in the URL, not here. |

## UI

| Concern | Choice | Role |
|---|---|---|
| Charts | **UnoVis** (`@unovis/react`) | Donut (status), bar / horizontal bar (platform, vendor, event types), daily bar (activations last 30 days — one column per day). Themed via CSS variables. |
| Tables | **Hand-rolled** (`<table>` + React state) | Sortable / filterable devices list — the hand-rolled showcase. No table library. |
| Styling | **Tailwind CSS v4 + CSS variables** | Dark background, `#09f` accent. Theme tokens as CSS variables; vanilla CSS only for the rare awkward case. |

## Quality / tooling

| Concern | Choice | Role |
|---|---|---|
| Lint + format | **Biome** | Single tool replacing ESLint + Prettier. Zero-config, both stable. |
| Unit / integration tests | **Vitest + Testing Library + jsdom** | TDD. Covers loading / error / offline paths. Chart data logic tested as pure functions. |
| Network mocking | **MSW** (v2) | `setupServer` (node) for tests; simulates latency, 500s, transport failure, empty states. Also used in dev to make loading/error states demoable. |
| E2E | **Out of scope** | Listed as a "next step" (one Playwright smoke test of the happy path). |

## Data source

- **Wultra mock API** — static JSON on GitHub Pages:
  `statistics.json`, `devices/index.json` (full 120-item collection — the `page-N.json`
  paginated variants go unused), `devices/{id}.json`. `users/*` endpoints unused (User is
  a label, not a page).
- Static hosting → no per-request rate limit; MSW is for demoing states & tests, not rate avoidance.

