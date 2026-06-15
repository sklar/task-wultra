# PRD: Device Dashboard

Status: ready-for-agent

A read-only SPA that visualises mobile **devices** paired against Wultra's authentication
backend, sourced from the static mock API. Companion docs: domain vocabulary in
[CONTEXT.md](../../CONTEXT.md), page specs in [PAGES.md](../../docs/PAGES.md), stack in
[TECH_STACK.md](../../docs/TECH_STACK.md), reasoning in
[JUSTIFICATION.md](../../JUSTIFICATION.md), and decisions in [docs/adr](../../docs/adr/). This
PRD uses the glossary's vocabulary throughout (Device, Status, User, Event, Event history) and
respects ADR-0001/0002/0003.

## Problem Statement

Someone monitoring a fleet of authentication-paired devices has no single place to answer
basic questions: How healthy is the fleet right now? What is it made of (platforms, vendors)?
What's it doing (event activity, recent activations)? Which specific devices exist, and what
has happened to a given device over its lifetime? The raw mock API exposes the data but
nothing renders, filters, or summarises it.

## Solution

A small single-page app with four routes:

- **Dashboard** — fleet health and composition at a glance: KPI cards + four charts from
  aggregate statistics, plus a "statistics as of" freshness line.
- **Devices** — a sortable/filterable/searchable table of all devices.
- **Device detail** — a single device's info and its full Event history.
- **Settings** — persisted user preferences (theme, table page size, timestamp format).

It makes real network calls with honest loading / error / empty / offline states, persists
preferences to localStorage, and uses a dark theme with the `#09f` accent.

## User Stories

1. As a fleet operator, I want a Dashboard overview, so that I can judge fleet health without
   reading raw data.
2. As an operator, I want KPI cards for total devices, active devices, total users, and total
   events, so that I see the headline numbers immediately.
3. As an operator, I want a donut of devices by **Status** (active / blocked / expired /
   removed), so that I see the health breakdown at a glance.
4. As an operator, I want a bar chart of devices by platform, so that I understand the device
   mix.
5. As an operator, I want a bar chart of Events by type, so that I see what kinds of activity
   dominate.
6. As an operator, I want a daily bar chart of activations over the last 30 days, so that I see
   recent onboarding without being misled by interpolation.
7. As an operator, I want a "statistics as of {date}" line near the charts, so that I know how
   fresh the aggregates are.
8. As an operator, I want the Dashboard to read top-to-bottom on mobile in a sensible order
   (numbers → health → composition → activity → trend), so that it's usable on a phone.
9. As an operator on a wide screen, I want the Dashboard laid out in a grid, so that I can take
   it in at once.
10. As an operator, I want a Devices page listing every device, so that I can browse the fleet.
11. As an operator, I want each device row to show its identity (vendor, model, shortId), its
    owning **User**'s name, status, platform, and activity dates, so that a row is meaningful
    on its own.
12. As an operator, I want to filter devices by status, so that I can isolate (e.g.) removed
    devices.
13. As an operator, I want to filter devices by platform, so that I can focus on one OS.
14. As an operator, I want to filter devices by vendor, so that I can focus on one manufacturer.
15. As an operator, I want a single search box matching shortId, model, and user name, so that
    I can quickly find a device or a person's devices.
16. As an operator, I want to sort devices by last-active date, so that I can find recently (or
    long-in)active devices.
17. As an operator, I want to sort devices by created date, so that I can find the newest or
    oldest devices.
18. As an operator, I want my filters, sort, and page reflected in the URL, so that I can
    share, bookmark, and use back/forward.
19. As an operator, I want to choose how many rows per page, so that the table fits how I work.
20. As an operator, I want first/prev/numbered/next/last pagination with "page X of Y", so that
    I can navigate a long list.
21. As an operator, I want a clear "no devices match" message when filters exclude everything,
    so that I'm not confused by an empty table.
22. As an operator, I want to click a device row to open its detail, so that I can investigate.
23. As an operator, I want a device's full info (identity, software versions, biometry,
    lifecycle dates, owning user) grouped clearly, so that I can review it.
24. As an operator, I want the device's **Status** shown as an authoritative badge, so that I
    trust the current state.
25. As an operator, I want the device's full **Event history** newest-first, so that I can see
    what happened over its lifetime.
26. As an operator, I want each Event to show type, time, result (success/rejected), location,
    and IP, so that I have the relevant detail.
27. As an operator, I want a note that the Event history is an audit log that may not reflect
    current status, so that I'm not misled when they disagree.
28. As an operator, I want to filter the Event history by type and by result, so that I can
    isolate (e.g.) rejected events or just logins.
29. As an operator, I want a clear "device not found" state for an unknown device, so that a bad
    link fails gracefully.
30. As a user, I want a Settings page for my preferences, so that the app adapts to me.
31. As a user, I want to choose dark / light / system theme, so that the app matches my
    environment; system should follow my OS and react to OS changes live.
32. As a user, I want a theme toggle in the header too, so that I can switch quickly from
    anywhere.
33. As a user, I want my preferences to apply instantly (no Save button), so that I see the
    effect immediately.
34. As a user, I want to choose a timestamp format (absolute or relative), so that dates read
    the way I prefer everywhere in the app.
35. As a user, I want my preferences to persist across reloads, so that I set them once.
36. As any user, I want a loading indicator (skeleton) while data fetches, so that the app feels
    responsive.
37. As any user, I want a clear error message with a Retry action when a fetch fails, so that I
    can recover.
38. As any user, when I go offline I want a non-intrusive notice and to keep seeing already
    loaded data, so that a dropped connection isn't treated as an error and doesn't blank the
    screen.
39. As any user, I want the data to refresh automatically when I reconnect, so that I don't have
    to reload.
40. As any user, I want the browser tab title to reflect the current page (and the device on a
    detail page), so that tabs, history, and bookmarks are meaningful.
41. As a keyboard / screen-reader user, I want a sensible reading and tab order and accessible
    timestamps, so that the app is usable without a mouse.
42. As any user, I want a header with logo + navigation and a minimal footer (version + links),
    so that I can move around and find the source.

## Implementation Decisions

- **Stack (locked, see TECH_STACK.md):** Vite + React + TypeScript, TanStack Router, TanStack
  Query v5, UnoVis charts, Tailwind v4 + CSS variables, Biome, Vitest + Testing Library +
  MSW.
- **Routes:** `/` (Dashboard), `/devices` (Devices), `/devices/$id` (Device detail),
  `/settings` (Settings). Device detail is reached from a Devices row, not the nav.
- **App shell:** persistent header (SVG logo left; nav + theme toggle right; three nav links;
  responsive top bar, no hamburger) and minimal footer (app version from `package.json` +
  GitHub link + Wultra mock API link). Header/footer persist; only `<main>` swaps.
- **Data source:** Dashboard reads `statistics.json`. Devices reads `devices/index.json` —
  **the full 120-item collection in one request** — and filters/sorts/paginates client-side
  (ADR-0002); the `page-N.json` and `users/*` endpoints are unused. Device detail reads
  `devices/{id}.json`.
- **Status vs Events (ADR-0001):** the `status` field is the single source of truth for
  badges/KPIs/charts; the Event history is a display-only audit log rendered verbatim,
  newest-first; status is never derived from events. A muted note owns the possible
  contradiction.
- **State homes:** server state in Query; filters/sort/page in typed URL search params
  (`validateSearch`); preferences in localStorage. No state-management library.
- **Preferences (ADR-0003):** theme, page size, and timestamp format flow through one small
  `PreferencesProvider` React Context — localStorage is the home of truth, the Context is the
  reactive carrier. Theme slice applies the `<html>` class and listens to
  `prefers-color-scheme` when `system`. Controls apply on change (no Save button). Page size
  default 25; timestamp default absolute.
- **Devices table:** sort targets are the two date columns only; status/platform/vendor are
  single-select filters (scalar URL params, AND-combined); one free-text search over shortId +
  model + user name. Default sort `lastActiveAt` desc. The user name renders as plain text (no
  Users page).
- **Device detail:** grouped info (Identity / Software / Lifecycle / User); Event history as a
  table with `type` and `result` single-select filters held in **local component state** (a
  transient in-page refinement, not URL); no sort, no in-page search (all events render, so
  native find-in-page suffices).
- **Charts:** donut (status), horizontal bars (platform, event type), vertical daily bar
  (activations, 30 days). A line/area and a calendar heatmap were rejected (sparse data;
  interpolation/horizon mismatch). Chart **data shaping** is extracted into pure functions.
- **Async states:** a reusable per-page async-state wrapper renders skeleton → error (+ Retry =
  manual `refetch`) → content. Offline is a separate path (`networkMode: 'online'` pauses
  queries): a global fixed-position snackbar (no reserved layout slot, no reflow), cached
  content stays visible, with an offline placeholder only on cold start (paused with no cache).
- **Document title:** static route titles via TanStack Router's `head` API + `<HeadContent />`;
  the dynamic detail title (`{model} ({shortId}) · …`) is set component-side from the resolved
  query (data lives in Query, not a router loader).
- **Theme:** dark default brand surfaces + `#09f` accent constant across themes; only
  surface/text CSS variables flip.

## Testing Decisions

A good test asserts **external, observable behaviour** through the public interface (rendered
roles/text, returned values) — never implementation details — and doesn't restate what the
type system already guarantees (per `.agents/rules/testing.md`). The suite is **deliberately
lean**: cover the risky behaviour with one representative case each, not exhaustive
combinatorics or trivial-render checks. Better a small, honest suite than hundreds of tests.

**Seams:**

- **Network boundary (MSW) — primary, highest seam.** Render a page/feature with a fresh
  `QueryClient` (`retry: false`) and MSW handlers; assert on accessible output. MSW supplies
  the scenario (latency, 500, transport failure, empty payloads); offline via
  `onlineManager.setOnline(false)`.
- **Pure functions — unit seam** for the data logic, where the real risk lives: stats→chart
  series shaping, the devices filter/sort/paginate pipeline, timestamp formatting, and theme
  resolution (`system` + `prefers-color-scheme` → effective theme).

**What gets tested (representative, not exhaustive):**

- Devices: loading skeleton; success rows; 500/transport→error + Retry; offline→snackbar +
  cached content retained; filtered-to-empty→empty state; one filter, one sort, search, and
  pagination each verified through the rendered table.
- Device detail: success→info + Event table; 404→not-found; type/result filter reflected in
  rows.
- Dashboard: success→KPI values + chart containers/labels present; one error/offline path.
- Pure functions: input→output for each transform above, including edge cases (empty input,
  the sparse activations series, the four status values incl. `blocked`).

**Why this split:** jsdom has no layout engine, so asserting rendered chart geometry would be
theatre — chart **data** is unit-tested, chart **presence** is integration-tested. There is no
prior art (greenfield); these are the first tests.

**Placement:** test files are **colocated** with the code they exercise (`Foo.test.tsx` beside
`Foo.tsx`). Shared scaffolding is centralised: MSW handlers + `setupServer` under `src/mocks/`,
and a `renderWithProviders` helper + per-test `QueryClient` factory under `src/test/`.

## Out of Scope

- Backend, authentication, SSR, Docker (explicitly excluded by the brief).
- Mutations / writing data — the API is read-only; only Query's read half is used.
- A Users page and the `users/*` endpoints — User is a label on a device, not its own section.
- The `page-N.json` paginated endpoints — superseded by loading the full collection (ADR-0002).
- Pixel-perfect and fully-responsive design; tables may horizontal-scroll on narrow screens.
- Multi-select filter facets; a calendar heatmap; a line/area activation trend; favourite
  devices; last-visited-page; an i18n layer — all README "next steps".
- E2E / Playwright and Vitest browser mode — a single happy-path smoke test is a "next step".
- Production-grade error handling and 100% coverage.

## Further Notes

- The mock API is internally consistent: aggregates reconcile exactly with the device records
  (status/platform/vendor) and with user records (country is a **User** attribute; `byCountry`
  counts users, not devices). The only incoherence is each device's synthetic Event history vs
  its own status/`lastActiveAt` — handled by ADR-0001.
- MSW doubles as the dev tool for demoing loading/error/offline states (the always-up static
  API can't produce them) and as the test network mock — same handlers, so dev and test
  exercise identical paths.
- TDD is aimed at the data layer; layout and chart rendering are not TDD-amenable in the time
  budget.
