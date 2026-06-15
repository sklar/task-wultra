# 03 — Devices table (render, states, row link)

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

The Devices route (`/devices`) showing every device in a table, with honest states and a link
into detail. Filtering/search (#04) and sorting/pagination (#05) build on this.

- **Data:** load `devices/index.json` — the full 120-item collection — once into a single Query
  entry (ADR-0002). The `page-N.json` and `users/*` endpoints are unused.
- **Table:** an identity cell (vendor · model, shortId, owning **User** `displayName` as plain
  text — there is no Users page), a status badge, platform, and the two date columns
  (`lastActiveAt`, `createdAt`). Default display order: `lastActiveAt` descending.
- **Row link:** clicking a row navigates to `/devices/$id` (the target may be a placeholder
  until #06).
- **Timestamps:** introduce the shared timestamp util and the `timestampFormat` preference
  (default `absolute`) in the Context. Every timestamp renders as a semantic
  `<time dateTime={iso}>`; in `relative` mode the visible text is relative and the absolute
  value is exposed via `title`.
- **States:** skeleton while loading; error + Retry; (interactive filters/sort/pagination come
  in #04/#05).

## Acceptance criteria

- [x] `devices/index.json` is loaded once (120 rows) into one Query entry; no `page-N`/`users`
      requests are made.
- [x] The table shows the identity cell, status badge, platform, and both date columns, in
      `lastActiveAt`-descending order by default.
- [x] Timestamps render via the shared util as `<time dateTime>`; `timestampFormat` (default
      absolute) lives in the Context; relative mode shows relative text with the absolute value
      in `title`.
- [x] Clicking a row navigates to `/devices/$id`.
- [x] Loading shows a skeleton; fetch failure shows error + Retry; offline shows the snackbar.
- [x] The timestamp util has unit tests for absolute and relative output.
- [x] Integration test: success renders rows; one error path.

## Blocked by

- [01 — Walking skeleton](01-walking-skeleton.md)

> Do not commit or push without explicit approval.
