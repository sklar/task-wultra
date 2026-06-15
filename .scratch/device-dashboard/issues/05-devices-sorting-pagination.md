# 05 — Devices sorting + pagination

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

Complete the devices table with sorting and client-side pagination, finishing the
filter → sort → paginate pipeline.

- **Sort:** clickable sort on the two date columns (`lastActiveAt`, `createdAt`), toggling
  ascending/descending; sort field + direction in the URL; default `lastActiveAt` descending.
  Categorical columns are not sortable.
- **Pagination:** client-side controls — first / prev / numbered pages / next / last, with
  "page X of Y"; current page in the URL.
- **Page size:** introduce the `pageSize` preference (default 25) in the Context, read by the
  table. The control to change it is surfaced in #07 (Settings).
- **Pipeline:** apply in order filter → sort → paginate. Sort and paginate are pure functions
  (the unit-tested seam).

## Acceptance criteria

- [ ] Sorting toggles on `lastActiveAt` and `createdAt` (asc/desc), with sort + direction in the
      URL; default is `lastActiveAt` descending.
- [ ] Pagination controls (first/prev/numbered/next/last + "page X of Y") work; the current page
      is in the URL.
- [ ] `pageSize` lives in the Context (default 25) and is respected by the table.
- [ ] The pipeline composes correctly (a filter + a sort + a page together produce the right
      rows); sort and paginate functions have unit tests.
- [ ] Integration: changing the sort reorders rows; pagination navigates pages; page size is
      respected.

## Blocked by

- [04 — Devices filtering + search](04-devices-filtering-search.md)

> Do not commit or push without explicit approval.
