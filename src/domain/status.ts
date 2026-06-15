// The four authoritative Status values, in canonical order (CONTEXT.md: Status is the
// device's lifecycle state — exactly four-valued, never three). This is the single
// source of truth for badges, KPIs, and the donut; never inferred from events
// (ADR-0001). `blocked` is always present, even when an aggregate omits a zero count.
export const STATUS_ORDER = ['active', 'blocked', 'expired', 'removed'] as const
export type Status = (typeof STATUS_ORDER)[number]
