# Status is authoritative; the event history is a display-only audit log

The mock API's aggregates and line-item records reconcile exactly (status, platform,
vendor, country-per-user, and ownership counts all match `statistics.json`), so the
Dashboard and the Devices table will never visibly disagree. The one thing that does
**not** cohere is each device's `events` array: a device can be `active` while its last
event is `removal`, and `lastActiveAt` is independent of the latest event timestamp.

**Decision:** Treat the device `status` field (and the reconciled aggregates) as the
single source of truth for every badge, KPI, and chart. Render the event history
verbatim, newest-first, as a display-only audit log — never derive, validate, or
reconcile status/activity/counts from it. The device-detail page carries one muted note
that the audit log may not reflect current status, so the contradiction is owned, not
hidden.

**Considered and rejected:** deriving/validating status from the latest lifecycle event.
On synthetic, incoherent event data it would flag nearly every device, adds real
lifecycle-inference logic, and builds a feature on data that cannot support it.
