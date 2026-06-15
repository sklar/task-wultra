# 02 — Dashboard

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

The Dashboard route (`/`): fleet health and composition at a glance, built entirely from
`statistics.json` (a single aggregate document). KPI cards plus four charts, with a freshness
line. Reuses the AsyncState wrapper from #01.

- **KPI cards (4):** total devices, active devices, users, total events (from `totals`).
- **Charts (4):** donut of devices by **Status** (`byStatus`, all four values incl. `blocked`);
  horizontal bar of devices by platform (`byPlatform`); horizontal bar of Events by type
  (`byEventType`); vertical bar of activations over the last 30 days (`activationsLast30Days`,
  one column per day).
- **Freshness:** "Statistics as of {`generatedAt`}" near the charts (not in the footer).
- **Chart data shaping** extracted into pure functions (the unit-tested seam).
- **Layout:** mobile single-column source order (KPIs → status → platform → event type →
  activations) reflowing to the desktop grid per PAGES.md.

Per ADR-0001, every number/chart comes from the authoritative aggregates. `byCountry` is users
by country and is not used here.

## Acceptance criteria

- [ ] `statistics.json` is fetched via Query; loading shows a skeleton; failure shows error +
      Retry; offline shows the snackbar with any cached content retained.
- [ ] Four KPI cards display `totals.devices`, `totals.activeDevices`, `totals.users`,
      `totals.events`.
- [ ] Donut renders the four statuses; platform and event-type horizontal bars render; the daily
      activations vertical bar renders one column per day.
- [ ] "Statistics as of {generatedAt}" appears near the charts.
- [ ] Chart-shaping logic is in pure functions with unit tests covering edge cases (empty input,
      the sparse activations series, the four status values including `blocked`).
- [ ] Source order and desktop grid match PAGES.md.
- [ ] Integration tests: success renders KPI values + chart containers/labels; one error path.

## Blocked by

- [01 — Walking skeleton](01-walking-skeleton.md)

> Do not commit or push without explicit approval.
