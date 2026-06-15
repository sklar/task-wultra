# 06 — Device detail

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

The Device detail route (`/devices/$id`): a single device's info and its full **Event history**,
reached by clicking a devices-list row.

- **Data:** fetch `devices/{id}.json` via Query.
- **Info panel:** a grouped definition list — Identity (vendor, model, shortId, platform),
  Software (osVersion, appVersion, biometryEnabled), Lifecycle (status badge, createdAt,
  lastActiveAt), User (displayName as plain text). Status comes from the authoritative `status`
  field (ADR-0001).
- **Event history:** a table of all events, newest-first, with columns `type`, `timestamp`,
  `result` (success/rejected, colour-coded), `location`, `ip`, and a muted note that the audit
  log may not reflect current status. No sort, no in-page search (all events render).
- **Event filters:** `type` and `result`, each single-select, held in **local component state**
  (not the URL) — a transient in-page refinement.
- **Not-found:** an unknown `id` (404) shows a clear "device not found" state.
- **Document title:** set component-side to `{model} ({shortId}) · Wultra Device Dashboard`
  once the query resolves (data lives in Query, not a router loader).

## Acceptance criteria

- [ ] `devices/{id}.json` is fetched via Query; loading shows a skeleton; failure shows error +
      Retry; an unknown id (404) shows a not-found state.
- [ ] The info panel is grouped Identity / Software / Lifecycle / User; status is an
      authoritative badge; the user name is plain text.
- [ ] The event history table renders all events newest-first with type/timestamp/result/
      location/ip and the muted audit-log note.
- [ ] Type and result filters are single-select, held in local state, and narrow the event rows.
- [ ] The document title becomes `{model} ({shortId}) · …` once data resolves.
- [ ] Integration: success renders info + events; 404 → not-found; a type/result filter is
      reflected in the rows.

## Blocked by

- [03 — Devices table](03-devices-table.md)

> Do not commit or push without explicit approval.
