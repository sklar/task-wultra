// Devices-table rows per page (PAGES.md / Settings). A localStorage preference, default
// 25 — matching the API's natural page size (ADR-0002). The control to change it lives on
// the Settings page (#07); the devices table reads it from the Context.
export const PAGE_SIZES = [10, 25, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]
export const DEFAULT_PAGE_SIZE: PageSize = 25
