# Pages

Product-level spec for each page: what it shows and in what order. The *what to render*,
not the *how* (stack lives in [TECH_STACK.md](TECH_STACK.md); vocabulary in
[CONTEXT.md](../CONTEXT.md)). All data is the Wultra mock API; aggregates and device
records reconcile exactly, so no page contradicts another (see
[ADR-0001](adr/0001-status-is-authoritative-events-are-display-only.md)).

## Page set

Four pages: **Dashboard** (`/`), **Devices** (`/devices`), **Device detail**
(`/devices/$id`), **Settings** (`/settings`). User is a label on a device, not its own
page.

## App shell

A header + footer wrapping every route.

**Header:** SVG logo (provided) on the left, nav and the theme toggle on the right. Nav has
**three** top-level links — Dashboard, Devices, Settings — with active-route highlighting.
Device detail is reached from the Devices table, not the nav. A **simple responsive top bar,
no hamburger** (three links fit on mobile; a hamburger for three items is over-engineering).

**Footer (global, minimal):** app version (from `package.json`) + repository (GitHub) link +
Wultra mock API link. No `generatedAt` (that's stats-specific and lives on the Dashboard), no
per-page provenance.

**Document title per route:** `{Page} · Wultra Device Dashboard` (e.g. "Devices · …"). Drives
browser tab/history/bookmarks and screen-reader page identity. Mechanism splits because data
lives in Query, not router loaders:

- **Static titles** (Dashboard, Devices, Settings) → TanStack Router's route `head` API
  (`head: () => ({ meta: [{ title }] })`) + `<HeadContent />` in the root. No data needed.
- **Dynamic detail title** (`{model} ({shortId}) · …`) → the data is in the Query cache (the
  URL has only the UUID `id`), so this one title is set component-side once the query resolves
  (a small title hook), rather than adding a router loader that duplicates the fetch.

**Mobile:** tables (devices, events) may **horizontal-scroll** on narrow screens — accepted;
the brief doesn't require full responsiveness.

## Dashboard (`/`)

Source: `statistics.json` (a single aggregate document). Charts + KPIs only — no table.

**Stats freshness:** "Statistics as of {`generatedAt`}" shown near the charts — not in the
global footer, since `generatedAt` is stats-specific and meaningless on other pages.

**KPI cards (4)** from `totals`:

| Card | Field |
|---|---|
| Total devices | `totals.devices` |
| Active devices | `totals.activeDevices` |
| Users | `totals.users` |
| Total events | `totals.events` |

**Charts (4):**

1. **Donut — devices by status** (`byStatus`): active / removed / blocked / expired.
2. **Horizontal bar — devices by platform** (`byPlatform`, 4 categories).
3. **Horizontal bar — events by type** (`byEventType`, 10 categories).
4. **Vertical bar — activations, last 30 days** (`activationsLast30Days`, one column/day).

### Layout

Source (DOM) order = mobile single-column scroll order = screen-reader / tab order. It
must read sensibly on its own; desktop reflows via CSS Grid `grid-template-areas` (never
the `order` property, which reorders pixels but leaves tab focus behind).

**Source order:** `KPI cards → byStatus → byPlatform → byEventType → activations`
(numbers → health → composition → activity → trend; composition pairs 2–3, activity
pairs 4–5).

**Desktop grid:**

```
"status   kpis"
"platform events"
"activations activations"
```

(Donut is the desktop top-left hero; KPIs stay source-first for the mobile/SR opener — a
one-slot within-row visual swap, a11y-acceptable.)

### Notes

- `activationsLast30Days` is sparse (5 activations over 30 days). Shown honestly as-is; a
  line/area was rejected (interpolating discrete daily counts is a visual lie), as was a
  calendar heatmap (only pays off over ~a year).
- `byCountry` is **users** by country, not devices — not used on this page; if ever added
  it must be labelled as users.

## Devices (`/devices`)

Source: `devices/index.json` (full 120-item collection), loaded once; filter/sort/paginate
client-side (see [ADR-0002](adr/0002-load-all-devices-client-side-table.md)). Filter, sort,
and page live in the URL; page size is a localStorage preference.

The table separates three interactions — **sort** (ordering questions), **filter** (category
facets), **search** (find by identity). A field earns a sortable column only if ordering it
answers a real question; categories are filtered, not sorted.

**Row display** (not every field is its own column):

- **Identity cell** — `vendor` · `model`, `shortId`, and the user `displayName` as plain
  text beneath (no link — there is no Users page). The row links to `/devices/$id` via `id`.
- **status** — badge.
- **platform** — shown.
- **lastActiveAt**, **createdAt** — shown in their sortable columns.

**Sortable columns** (the only sort targets):

- `lastActiveAt` — default sort, descending (most recently active first).
- `createdAt` — device age.

**Filter facets:** `status` (active / blocked / expired / removed), `platform`, `vendor`.
Each is **single-select** (a scalar URL param, e.g. `?status=active&platform=iOS`), combined
with AND. Single-select is deliberate: multi-select chip inputs are hard to get right
(keyboard, overflow, a11y) and not worth the time budget; free-text search already covers
finding a mix. Multi-select is a README "next step."

**Search:** one free-text box matching `shortId` + `model` + user `displayName`.

**Pagination:** client-side. Controls: first / prev / numbered pages / next / last, with
"page X of Y". Page size is a localStorage preference, **default 25** (matches the API's
natural page size).

**States:** skeleton rows while loading; a clear "no devices match" empty state when
filters/search exclude everything. (Error and offline/paused presentation is a cross-cutting
concern — see that topic, not per-page.)

## Device detail (`/devices/$id`)

Source: `devices/{id}.json` (carries everything a list item has plus `osVersion`,
`appVersion`, `biometryEnabled`, and the full `events[]`). Reached by clicking a devices-list
row (links via `id`). Status badge comes from the `status` field; the event history is a
display-only audit log (see
[ADR-0001](adr/0001-status-is-authoritative-events-are-display-only.md)).

**Info panel** — grouped definition list:

| Group | Fields |
|---|---|
| Identity | `vendor`, `model`, `shortId`, `platform` |
| Software | `osVersion`, `appVersion`, `biometryEnabled` (on/off) |
| Lifecycle | `status` (badge), `createdAt`, `lastActiveAt` |
| User | `displayName` (plain text — no Users page) |

**Event history** — a table of all events (range 5–27, avg ~16 per device), newest-first,
with a muted note that the audit log may not reflect current status. Columns: `type`,
`timestamp`, `result` (success / rejected, colour-coded), `location`, `ip`.

- **Filters:** `type` and `result`, each single-select. **No sort, no search.**
- **Filter state is local** (component state, not the URL) — a transient in-page refinement,
  not primary navigation.
- No in-page search: all events render, so the browser's native find-in-page covers ad-hoc
  lookups.

**States:** skeleton while loading; a **not-found** state for an unknown `id` (unknown ids
404). Error/offline deferred to the cross-cutting pass.

## Cross-cutting: async states

Each page has one primary query, so loading/error/empty are **page-level**, rendered through
a single reusable async-state wrapper for consistency:

- **Loading** — skeletons (table rows on Devices, blocks on Dashboard/Detail).
- **Error** (`isError`, after Query's auto-retries) — a clear message + a **Retry** button
  (manual `refetch`). Page-level, not per-widget.
- **Empty** / **not-found** — per-page (see Devices, Device detail).

**Offline / paused is a separate path from error** (`networkMode:'online'` pauses the query
at `fetchStatus:'paused'` and auto-resumes on reconnect — never an error). Presentation:

- A **global offline snackbar** — `position: fixed` overlay (no reserved layout slot, so
  content never reflows when it appears/disappears) — shown whenever `onlineManager` reports
  offline ("You're offline — will refresh when reconnected"); it clears itself on reconnect.
- Pages **keep showing last-cached content** beneath the banner — no blanking, no skeletons,
  because static read-only data is always safe to show stale.
- **Cold-start offline** (paused with no cached content yet) is the one exception: the wrapper
  shows an offline placeholder instead of an infinite skeleton.

MSW makes all of these (latency, 500, transport failure, empty, offline) triggerable in dev.

## Settings (`/settings`)

The home for **localStorage** preferences (chosen over a Users page for this purpose). All
three flow through one `PreferencesProvider` Context (localStorage is the home of truth; the
Context keeps consumers in sync — see
[ADR-0003](adr/0003-preferences-via-one-context-no-store-library.md)). Three preferences, no
more:

- **Theme** — `dark` / `light` / `system`, **default `system`**. `system` follows
  `prefers-color-scheme` and reacts live to OS changes (matchMedia listener); an explicit
  `dark`/`light` choice overrides the OS. The `#09f` accent is constant across themes —
  only surface/text variables flip, which exercises the CSS-variable theming. The control
  appears **both in the header** (quick, expected location) **and on this page**; both drive
  the same Context value. Note: with `system` default, first load may render light on a
  light-OS machine — accepted.
- **Page size** — devices-table rows per page: `10` / `25` / `50` / `100`, **default 25**.
  Read by the devices table (see [ADR-0002](adr/0002-load-all-devices-client-side-table.md)).
- **Timestamp format** — `absolute` / `relative`, **default `absolute`**. Applies to every
  timestamp in the app (list, detail info, event rows) via one shared formatting util. Every
  timestamp renders as a semantic `<time dateTime={iso}>` so machines/AT get the exact value
  regardless of mode. In **relative** mode the visible text is e.g. "3 weeks ago" and the
  absolute value is exposed via the `title` attribute (native tooltip); the `<time dateTime>`
  carries the ISO for accessibility.

All three persist to localStorage. Filters/sort/page are **not** here — they live in the URL by
design. Favourite devices and last-visited-page are README "next steps", not built.

**Controls apply on change — no Save button.** Each control writes straight through the
`PreferencesProvider` setter (instant UI update + localStorage write). This is the standard
preferences pattern, stays consistent with the instant header theme toggle, and is *less* code
than a Save button (which would need draft state, dirty tracking, and an unsaved-changes
guard). The change *is* its own confirmation — theme recolors, timestamps reformat live. No
debounce/on-blur needed: all three are discrete-choice controls, not free-text.
