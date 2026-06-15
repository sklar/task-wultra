# 07 — Settings

Status: ready-for-agent

## Parent

[PRD: Device Dashboard](../PRD.md)

## What to build

The Settings route (`/settings`): the home for the localStorage preferences, surfacing controls
for the three prefs already living in the `PreferencesProvider` Context.

- **Theme** — dark / light / system.
- **Page size** — devices-table rows per page: 10 / 25 / 50 / 100.
- **Timestamp format** — absolute / relative.

All controls **apply on change** — no Save button. Each writes straight through the Context
setter (instant UI update + localStorage write). The change is its own confirmation (theme
recolors, timestamps reformat live). No debounce/on-blur — all three are discrete-choice
controls.

## Acceptance criteria

- [ ] The page shows three controls bound to the Context: theme, page size, timestamp format.
- [ ] Each control applies on change with no Save button; the value persists to localStorage.
- [ ] Changing a pref reflects live in its consumers (theme across the app incl. the header
      toggle; page size in the devices table; timestamp format in every `<time>`).
- [ ] Integration: changing each preference updates localStorage and a visible consumer.

## Blocked by

- [01 — Walking skeleton](01-walking-skeleton.md)
- [03 — Devices table](03-devices-table.md)
- [05 — Devices sorting + pagination](05-devices-sorting-pagination.md)

> Do not commit or push without explicit approval.
