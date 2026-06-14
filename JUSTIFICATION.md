# Justification

Why the stack and architecture look the way they do — what got picked, what got passed on,
and the tradeoff swallowed in each case. Companion to [docs/TECH_STACK.md](docs/TECH_STACK.md)
(the *what*); this is the *why*. Written to be defended line-by-line: every call here should
survive a cheerful "…but why not X?".

## Guiding principles

Five themes drive every decision below:

- **Small and honest over big and TODO-ridden.**  
  The brief asks for it, so every dependency
  has to earn its seat.
- **If I can't explain it, it doesn't ship.**  
  No vendored mystery code.
- **Novelty budget is finite — spend it where it pays.**  
  Modern picks go where they add real value (routing, data); the boring, battle-tested option wins everywhere else.
- **Speed is a red herring here.**  
  Four pages build, lint, and type-check before you blink, so nothing was chosen for raw throughput — only fit. (Several candidates sell themselves on
  speed. Noted; ignored.)
- **State has three homes.**  
  Server state → TanStack Query, navigation/filters → the URL, preferences → localStorage. Name the homes and the "global store" question answers itself.

## At a glance

| Layer | Pick | Over | Why |
|---|---|---|---|
| Build | **Vite 8** (Rolldown) | Next.js, Remix | Current stable Vite, zero migration cost, SSR not needed. |
| Routing | **TanStack Router** | React Router | Typed, validated URL search params out of the box. |
| Server state | **TanStack Query** v5 | hand-rolled fetch | Caching + loading/error/offline states for free. |
| Client state | **one small Context** | Redux, Zustand | Only app-wide client state is user prefs; a Context carries them — not a store library. |
| Charts | **UnoVis** | Recharts, Chart.js | CSS-variable theming matches the `#09f` token system. |
| Tables | **hand-rolled** | TanStack Table | A `<table>` + state is less code than the headless setup. |
| Styling | **Tailwind v4 + CSS vars** | shadcn/ui | Dark + `#09f` is a theming problem; vars are the textbook tool. |
| Lint + format | **Biome** | Oxc, ESLint+Prettier | One stable tool, ~zero config, replaces two. |
| Tests | **Vitest + TL + MSW** | — | Risk lives in the data layer; mock at the network seam. |

## Build: Vite 8 (Rolldown) + React + TypeScript

Vite was the obvious SPA tool (the brief lists it). Vite 8 (stable March 2026) ships Rolldown
as its single Rust bundler, so "Vite 8 with Rolldown" is just Vite 8. Low-risk here precisely
because it's greenfield — the known Vite-8 headaches (`rollupOptions` rename, CJS interop,
Yarn PnP) are all *migration* pain, and there's nothing to migrate. The honest pitch isn't
speed; it's **zero migration cost and one bundler for dev + prod**, which kills a whole class
of "works in dev, breaks in build" bugs.

**Passed on:** **Next.js** and **Remix**. SSR isn't required, and reaching for a framework you
don't use just invites "so why the framework?". Next brings App-Router machinery we'd never
exercise; Remix layers server rendering and loaders/actions onto the same React Router a
client-only dashboard doesn't need. Staying a pure SPA is exactly what points to TanStack
Router next.

## Routing: TanStack Router

This app is filter-heavy, and filter/sort/pagination belong in the URL. TanStack Router treats
search params as **first-class, typed, and validated** (`validateSearch`), so URL-as-state is
ergonomic instead of a pile of hand-parsing. Bonus: same mental model as TanStack Query, fully
type-safe end to end.

**Passed on:** **React Router** — the ubiquitous default, and the one reviewers know best. But
its `useSearchParams` is stringly-typed and unvalidated, so all the filter logic would be
hand-rolled — right where this app spends its time. **Tradeoff:** steeper learning curve and a
smaller ecosystem (fewer 1am Stack Overflow hits), accepted for the search-param ergonomics.

## Server state / networking: TanStack Query

Query knocks out three requirements at once — real network calls, loading states, and error
states (`isLoading` / `isError` / retry is basically the error-handling requirement for free).
It caches across route changes, so navigating away from and back to the devices table is
instant.

The devices table doesn't page over the network: `devices/index.json` is the whole 120-item
collection, fetched once, then sorted/filtered/paginated client-side (see
[ADR-0002](docs/adr/0002-load-all-devices-client-side-table.md)). Page changes are synchronous
slices with no round-trip.

The detail worth defending: with the default `networkMode: 'online'`, **offline isn't an
error** — Query *pauses* the query (`fetchStatus: 'paused'`) and auto-resumes on reconnect. So
"offline" and "server 500" are two distinct code paths with distinct UI. Only the read half of
Query is used; mutations sit idle because the API is read-only.

## State management: no global store

No Redux, no Zustand — and that's the decision, not an omission. Server state is in Query,
navigation/filters are in the URL, preferences are in localStorage, and transient bits (a
dropdown's open state) stay local. **A justified absence beats an unnecessary dependency.**

The one piece of genuinely app-wide client state is **user preferences** (theme, page size,
timestamp format), read and written from several places. That's carried by a single small
React **Context** (`PreferencesProvider`) — not a store library. localStorage stays the home
of truth; the Context is just the reactive in-memory carrier that keeps consumers in sync (see
[ADR-0003](docs/adr/0003-preferences-via-one-context-no-store-library.md)). Rejecting a *state
library* and using a *Context for cross-cutting prefs* are not in tension.

Putting filters in the URL also buys real UX for free: shareable, bookmarkable, back/forward,
refresh-safe. One nuance handled — high-frequency updates (typing in search) use `replace` so
they don't spam history; deliberate ones (page, tab) use `push`.

## Charts: UnoVis

The dashboard needs the usual suspects — donut (status), bar / horizontal bar (platform,
vendor, event types), and a daily bar for the 30-day activation trend (one column per day).
UnoVis wins on two counts: its theming is **CSS-variable-first** (a perfect match for the
`#09f`-via-variables system) and it exposes real React components, not an imperative wrapper.

**On the trend chart specifically:** the data is `activationsLast30Days` — 30 discrete daily
counts. A **line/area was rejected** because it interpolates between points, implying a
continuous value that discrete daily counts don't have. A bar (one column per day) uses the
strongest visual encoding (length/position) and lets each day be read exactly.

**Passed on:** **Recharts** was the safe pick — bigger ecosystem, SVG, reviewers know it — but
UnoVis's theming fit and TS-first design edged it out (**tradeoff:** smaller community).
**Chart.js** is canvas-based (can't inspect/test/CSS-style it). **Victory** is heavier and
sleepier. **Observable Plot / Frappe / Chartist** are imperative-in-React (mount via
`useEffect` — extra seam). **Taucharts** is for exploratory BI, wrong tool.

## Tables: hand-rolled

Same "would we use 10% of it?" test as the charts. **TanStack Table** is headless and
powerful but verbose, and a sortable/filterable list uses a sliver of it. A plain `<table>`
with sort/filter in React state is less code and fully understood. TanStack Table is the
answer the moment columns grow real complexity — noted, not adopted.

## Styling: Tailwind v4 + CSS variables

Theme tokens as CSS variables (`--accent: #09f`, dark surfaces), Tailwind for layout and most
styling, plain CSS as the escape hatch for the rare thing utilities fumble. This hits the
dark-+-`#09f` requirement head-on (it's a theming problem; variables are the textbook answer),
builds fast, and keeps components hand-built and explainable. Tailwind v4's CSS-first `@theme`
makes token setup clean — and the theme toggle conveniently *is* the localStorage-preference
requirement.

**Passed on:** **shadcn/ui** copies a few hundred lines of Radix + Tailwind into the repo —
i.e. a few hundred lines of someone else's code to defend under cross-examination, the
opposite of "small and clear." Only worth it for genuine accessible-component needs (a real
combobox/dialog), and even then the move is one or two Radix primitives, not the whole system.
Styling is where the novelty budget is *deliberately* underspent.

## Lint + format: Biome

One stable tool replaces ESLint + Prettier at ~zero config — the tightest possible fit for a
small codebase, and a one-sentence defence.

**Passed on:** **Oxc / Oxlint** is the speed king but lint-only; its formatter (Oxfmt) is
still beta, so all-Oxc means a beta formatter or a second tool either way. The "Vite 8 already
uses Oxc, so unify on it" pitch is a trap — Vite uses Oxc for *transforms* regardless of the
linter, so they're independent choices. **ESLint + Prettier** is the heavier legacy pairing
this exists to avoid.

## Testing: Vitest + Testing Library + jsdom + MSW (TDD)

TDD aims at the **data layer** — loading, success, server-error, transport-failure, empty
states — because that's where the risk and the interesting logic live; layout and charts
aren't TDD-amenable in the time budget. MSW intercepts at the network layer, so Query's real
retry/loading/error behaviour runs unchanged against the mock, and what's demoed in dev is
byte-for-byte what hits the real API.

Two footguns pre-defused: a fresh `QueryClient` per test with `retry: false` (default retries
make error tests hang and flake), and offline simulated via `onlineManager.setOnline(false)`
to exercise the paused path separately from a 500. Chart **data shaping is extracted
and unit-tested as pure functions** — jsdom has no layout engine, so rendered-chart assertions
there would be theatre.

## Out of scope (on purpose)

- **E2E / Playwright** — skipped on testing-pyramid ROI, not just time: the risk is in
  data/error/offline logic, already covered at the integration level. The one real gap (jsdom
  isn't a browser, so it can't prove real routing + fetch + render) is genuinely E2E's job — a
  single happy-path smoke test is the top "next step" in the README.
- **Vitest browser mode** (stable since Vitest 4) — a higher-fidelity middle layer, but it
  adds Playwright setup, a different CI shape, and forces MSW from `setupServer` (node) to
  `setupWorker` (browser). Since assertions are on roles/text, not pixels, jsdom's lower
  fidelity costs nothing here.

## Mock API & MSW

The Wultra mock API is static JSON on GitHub Pages. The *original* reason to add MSW — dodging
a per-request rate limit — turned out to be a non-problem (static hosting has soft bandwidth
limits, not throttling a solo dev would hit, and Query's cache + the CDN cushion reloads). The
**real** justification is stronger: an always-up, instant API can't produce the loading and
error states the brief asks for. MSW makes them triggerable and demoable on demand — and
doubles as the test mock.
