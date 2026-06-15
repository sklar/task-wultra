# 04 — Devices filtering + search

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

Add filtering and search to the devices table, all reflected in the URL so the view is
shareable and survives refresh/back-forward.

- **Filters:** `status`, `platform`, `vendor` — each **single-select** (a scalar typed URL
  search param via `validateSearch`), combined with AND.
- **Search:** one free-text box matching `shortId` + `model` + owning user `displayName`
  (case-insensitive).
- **URL state:** filter and search values live in the URL. High-frequency search updates use
  `replace` (don't spam history); deliberate filter changes use `push`.
- **Empty state:** when filters/search exclude everything, show a clear "no devices match"
  message.
- The filter/search predicate is a pure function (the unit-tested seam).

## Acceptance criteria

- [x] Status, platform, and vendor filters are single-select scalar URL params, AND-combined.
- [x] The search box matches shortId, model, and user displayName (case-insensitive).
- [x] Filter and search state is in the URL — shareable, refresh-safe, back/forward works;
      search updates use `replace`.
- [x] An empty "no devices match" state shows when the result set is empty.
- [x] The filter/search predicate has unit tests.
- [x] Integration: applying a filter narrows the rows; searching narrows the rows; the empty
      state appears when nothing matches.

## Blocked by

- [03 — Devices table](03-devices-table.md)

> Do not commit or push without explicit approval.
