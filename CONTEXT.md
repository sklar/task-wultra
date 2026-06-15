# Device Dashboard

A read-only SPA that visualises mobile devices paired against Wultra's authentication
backend, sourced from a static mock API. This glossary fixes the vocabulary for the
domain so UI copy, code, and tests all say the same thing.

## Language

**Device**:
A mobile device a user has activated against the authentication backend. Has a
`vendor`, `model`, `platform`, a `status`, an owning user, and an event history.
Identified by `id` (UUID, used in URLs/links) and `shortId` (e.g. `d-0001`, used for
human-facing display).
_Avoid_: handset, token, instance.

**Status**:
A device's current authoritative lifecycle state. Exactly four values: **active**,
**blocked**, **expired**, **removed**. This is the source of truth for all badges,
KPIs, and the status donut — never inferred from events.
_Avoid_: state; and never treat status as three-valued (active/removed/expired) — there
are four.

**User**:
The owner of one or more devices. Has `displayName`, `country`, `tier`
(standard / premium), and a `deviceCount`. A secondary concept in this app — surfaced
as a label on a device, not as its own browsable section.
_Avoid_: customer, account, owner-as-separate-entity.

**Event**:
A single record in a device's history (e.g. `activation`, `login`, `signature`,
`removal`, `push_approved`, `biometry_enabled`, …), each with a `timestamp`, `result`
(success / rejected), `ip`, and `location`.
_Avoid_: log entry, action, activity.

**Event history**:
The ordered list of a device's events. Treated as a **display-only audit log**: rendered
verbatim, newest-first. Status, activity, and counts are never derived from it, and it
may not cohere with the device's current `status` (the data is synthetic).
_Avoid_: timeline-as-source-of-truth, lifecycle log.

**Activation** (disambiguation):
Three distinct "active" things that must not be conflated:
- **`active`** — a `status` value.
- **`activation`** — an `event` type (a device being paired).
- **`lastActiveAt`** — a device timestamp field, independent of the event history.

**Country**:
A **User** attribute, not a device attribute. The `byCountry` aggregate counts users,
so any "by country" visual is **users by country** — never devices by country.
