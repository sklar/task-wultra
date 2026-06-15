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

// Default display order: most recently active first (PAGES.md). Returns a new array;
// interactive sort/pagination arrive in #05.
export function sortByLastActiveDesc(devices: Device[]): Device[] {
	return [...devices].sort((a, b) =>
		b.lastActiveAt.localeCompare(a.lastActiveAt),
	)
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

function asNonEmptyString(value: unknown): string | undefined {
	return typeof value === 'string' && value.length > 0 ? value : undefined
}

// `validateSearch` for the devices route: coerce raw URL params into the typed
// `DeviceFilter`. Each facet is a single scalar; unknown/blank values are dropped so
// only set facets appear in the URL (keeping it shareable and tidy).
export function validateDevicesSearch(
	raw: Record<string, unknown>,
): DeviceFilter {
	const filter: DeviceFilter = {}
	if (STATUS_ORDER.includes(raw.status as Status)) {
		filter.status = raw.status as Status
	}
	const platform = asNonEmptyString(raw.platform)
	if (platform) filter.platform = platform
	const vendor = asNonEmptyString(raw.vendor)
	if (vendor) filter.vendor = vendor
	const search = asNonEmptyString(raw.search)
	if (search) filter.search = search
	return filter
}
