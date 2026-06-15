# 01 — Walking skeleton: shell, routing, theming, async/offline foundation

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

The foundation every later slice builds on, proven end-to-end. A user can launch the app,
navigate the four routes, flip the theme, and see honest loading/error/offline behaviour —
even though the pages themselves are still placeholders.

- **Routing:** TanStack Router with four routes — `/`, `/devices`, `/devices/$id`, `/settings`
  — rendering placeholder bodies. Only `<main>` swaps between routes.
- **App shell:** persistent header (SVG logo on the left — a placeholder is fine until the real
  asset is supplied; three-link nav with active-route highlighting; theme toggle on the right)
  and a minimal footer (app version from `package.json` + GitHub link + Wultra mock API link).
- **Styling foundation:** Tailwind v4 with the CSS-first `@theme` setup; design tokens as CSS
  variables — `--accent: #09f` constant across themes, plus dark/light surface and text tokens.
  Dark is the default brand palette.
- **Preferences (theme slice):** a single `PreferencesProvider` React Context holding the theme
  pref (`dark` / `light` / `system`, default `system`), persisted to localStorage. `system`
  follows `prefers-color-scheme` and reacts to OS changes live; an explicit choice overrides.
  The header toggle drives it. localStorage is the home of truth; the Context is the reactive
  carrier (per ADR-0003).
- **Data layer:** a `QueryClient` provider; MSW wired for both the dev server and tests
  (`setupServer`); shared test scaffolding — a `renderWithProviders` helper and a per-test
  `QueryClient` factory with `retry: false`.
- **Async states:** a reusable AsyncState wrapper that renders skeleton → error (+ a Retry
  action calling `refetch`) → content, demonstrated against one sample query.
- **Offline path:** a global fixed-position offline snackbar (no reserved layout slot, no
  content reflow) shown when `onlineManager` reports offline and cleared on reconnect; already
  loaded content stays visible (a separate path from error).
- **Document titles:** each route sets `{Page} · Wultra Device Dashboard` via the router `head`
  API + `<HeadContent />`.

## Acceptance criteria

- [x] All four routes are reachable via the header nav, with active-route highlighting; only the
      main region changes between routes.
- [x] Tailwind v4 is configured; tokens exist as CSS variables (`--accent: #09f` constant; dark
      and light surface/text tokens); dark is the default.
- [x] Theme can be set to dark / light / system through the Context and persists across reloads;
      `system` follows the OS and updates live; the header toggle works.
- [x] A `QueryClient` is provided; MSW intercepts requests in dev and in tests;
      `renderWithProviders` and a per-test `QueryClient` (`retry: false`) helper exist.
- [x] The AsyncState wrapper shows skeleton → error + Retry → content against a sample query.
- [x] The offline snackbar appears when offline and clears on reconnect, without reflowing
      layout; loaded content is retained.
- [x] Each route sets its document title via the router `head` API.
- [x] Footer shows app version + GitHub link + Wultra mock API link.
- [x] Smoke tests: nav changes route; theme toggle persists; AsyncState shows error + Retry;
      offline snackbar appears when offline.

## Blocked by

None - can start immediately.

> Note: one human input — the real SVG logo asset. Use a placeholder until it's provided.
> Do not commit or push without explicit approval.
