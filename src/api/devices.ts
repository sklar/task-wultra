import { queryOptions } from '@tanstack/react-query'
import type { Status } from '../domain/status'
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
// interactive sort/filter/pagination arrive in #04/#05.
export function sortByLastActiveDesc(devices: Device[]): Device[] {
	return [...devices].sort((a, b) =>
		b.lastActiveAt.localeCompare(a.lastActiveAt),
	)
}
