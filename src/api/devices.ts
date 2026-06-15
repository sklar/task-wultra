import { queryOptions } from '@tanstack/react-query'
import type { Status } from '../domain/status'
import { STATUS_ORDER } from '../domain/status'
import { fetchJson } from './client'

// The owning User as it appears on a device list item — a label, not its own page
// (CONTEXT.md). Only `displayName` is surfaced in the table.
export type DeviceUser = {
	id: string
	displayName: string
}

// One Device as carried by `devices/index.json`. `id` (UUID) addresses the detail
// route; `shortId` is the human-facing handle.
export type Device = {
	id: string
	shortId: string
	vendor: string
	model: string
	platform: string
	status: Status
	createdAt: string
	lastActiveAt: string
	user: DeviceUser
}

// An Event's outcome (CONTEXT.md): exactly success or rejected, colour-coded in the UI.
export type EventResult = 'success' | 'rejected'

// One Event in a device's history (CONTEXT.md). Rendered verbatim as a display-only
// audit log (ADR-0001) — never used to derive status/activity.
export type DeviceEvent = {
	id: string
	type: string
	timestamp: string
	ip: string
	location: string
	result: EventResult
}

// The detail document (`devices/{id}.json`): everything a list item carries plus the
// software fields and the full Event history. The owning User is still just a label.
export type DeviceDetail = Device & {
	osVersion: string
	appVersion: string
	biometryEnabled: boolean
	events: DeviceEvent[]
}

// Single Query entry per device id. The detail page reads this; the URL only carries
// the UUID `id`, so the dynamic document title is derived from the resolved data.
export function deviceDetailQueryOptions(id: string) {
	return queryOptions({
		queryKey: ['device', id],
		queryFn: () => fetchJson<DeviceDetail>(`devices/${id}.json`),
	})
}

// Pure sort — the unit-tested seam. Renders the audit log newest-first (CONTEXT.md);
// timestamps are ISO, so they sort lexicographically in chronological order. Returns a
// new array (the source is never reordered).
export function sortEventsNewestFirst(events: DeviceEvent[]): DeviceEvent[] {
	return [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

// The Event-history filters: `type` and `result`, each single-select and held in local
// component state (PAGES.md) — a transient in-page refinement, not URL state.
export type EventFilter = {
	type?: string
	result?: EventResult
}

// Pure filter predicate — the unit-tested seam. Applies the two single-select facets
// (AND-combined); an absent facet is "no constraint".
export function filterEvents(
	events: DeviceEvent[],
	filter: EventFilter,
): DeviceEvent[] {
	return events.filter((e) => {
		if (filter.type && e.type !== filter.type) return false
		if (filter.result && e.result !== filter.result) return false
		return true
	})
}

// The full collection document: the entire 120-item set in one response (ADR-0002).
// `totalItems` etc. describe the unused server-side paginated view.
export type DevicesResponse = {
	totalItems: number
	totalPages: number
	pageSize: number
	items: Device[]
}

// Load the whole collection once into a single Query entry, then sort/filter/paginate
// client-side (ADR-0002). The `page-N.json` and `users/*` endpoints stay unused.
export const devicesQueryOptions = queryOptions({
	queryKey: ['devices'],
	queryFn: async () => {
		const data = await fetchJson<DevicesResponse>('devices/index.json')
		return data.items
	},
})

// The only sortable columns are the two date fields (PAGES.md): categorical columns are
// filtered, not sorted.
export type SortField = 'lastActiveAt' | 'createdAt'
export type SortDirection = 'asc' | 'desc'
export type DeviceSort = { field: SortField; direction: SortDirection }

// Default display order: most recently active first (PAGES.md).
export const DEFAULT_SORT: DeviceSort = {
	field: 'lastActiveAt',
	direction: 'desc',
}

// Pure sort — the unit-tested seam (PRD Testing Decisions). Both sort fields are ISO
// timestamps, which sort lexicographically in chronological order. Returns a new array.
export function sortDevices(devices: Device[], sort: DeviceSort): Device[] {
	const factor = sort.direction === 'asc' ? 1 : -1
	return [...devices].sort(
		(a, b) => factor * a[sort.field].localeCompare(b[sort.field]),
	)
}

// A client-side page of a collection (ADR-0002): the slice plus the clamped current page
// and the total number of pages, so the controls can render "page X of Y".
export type Paginated<T> = {
	items: T[]
	page: number
	totalPages: number
}

// Pure pagination — the unit-tested seam (PRD Testing Decisions). Type-agnostic slicing.
// Always reports at least one page (an empty collection is "page 1 of 1") and clamps an
// out-of-range page into range so a stale URL or a filter that shrinks the result set can
// never blank the table.
export function paginate<T>(
	items: T[],
	page: number,
	pageSize: number,
): Paginated<T> {
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
	const current = Math.min(Math.max(1, Math.trunc(page)), totalPages)
	const start = (current - 1) * pageSize
	return {
		items: items.slice(start, start + pageSize),
		page: current,
		totalPages,
	}
}

// The devices table's facet filters + free-text search, mirrored in the URL. Each facet
// is single-select (a scalar) and AND-combined; an absent facet is "no constraint".
export type DeviceFilter = {
	status?: Status
	platform?: string
	vendor?: string
	search?: string
}

// Pure filter/search predicate — the unit-tested seam (PRD Testing Decisions). Applies
// the single-select facets (AND) and a case-insensitive free-text search over shortId,
// model, and the owning user's displayName.
export function filterDevices(
	devices: Device[],
	filter: DeviceFilter,
): Device[] {
	const search = filter.search?.trim().toLowerCase()
	return devices.filter((device) => {
		if (filter.status && device.status !== filter.status) return false
		if (filter.platform && device.platform !== filter.platform) return false
		if (filter.vendor && device.vendor !== filter.vendor) return false
		if (search) {
			const haystack = [
				device.shortId,
				device.model,
				device.user.displayName,
			].map((field) => field.toLowerCase())
			if (!haystack.some((field) => field.includes(search))) return false
		}
		return true
	})
}

// The full devices-route URL state: the filter/search facets plus the sort and page,
// which also live in the URL so the whole view is shareable and survives back/forward
// (PRD: filters/sort/page in typed search params). Page size is the one exception — a
// localStorage preference, not URL state.
export type DevicesSearch = DeviceFilter & {
	sort?: SortField
	dir?: SortDirection
	page?: number
}

// The effective sort for a given URL state, falling back to the default when absent.
export function resolveSort(search: DevicesSearch): DeviceSort {
	return {
		field: search.sort ?? DEFAULT_SORT.field,
		direction: search.dir ?? DEFAULT_SORT.direction,
	}
}

function asNonEmptyString(value: unknown): string | undefined {
	return typeof value === 'string' && value.length > 0 ? value : undefined
}

function isSortField(value: unknown): value is SortField {
	return value === 'lastActiveAt' || value === 'createdAt'
}

function isSortDirection(value: unknown): value is SortDirection {
	return value === 'asc' || value === 'desc'
}

// `validateSearch` for the devices route: coerce raw URL params into the typed
// `DevicesSearch`. Facets are single scalars; unknown/blank values are dropped, as is the
// default page (1), so only meaningful state appears in the URL (shareable and tidy).
export function validateDevicesSearch(
	raw: Record<string, unknown>,
): DevicesSearch {
	const search: DevicesSearch = {}
	if (STATUS_ORDER.includes(raw.status as Status)) {
		search.status = raw.status as Status
	}
	const platform = asNonEmptyString(raw.platform)
	if (platform) search.platform = platform
	const vendor = asNonEmptyString(raw.vendor)
	if (vendor) search.vendor = vendor
	const text = asNonEmptyString(raw.search)
	if (text) search.search = text
	if (isSortField(raw.sort)) search.sort = raw.sort
	if (isSortDirection(raw.dir)) search.dir = raw.dir
	const page = Number(raw.page)
	if (Number.isInteger(page) && page > 1) search.page = page
	return search
}
