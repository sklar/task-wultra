import { queryOptions } from '@tanstack/react-query'
import { fetchJson } from './client'

// A single key/value aggregate row (e.g. one Status, one platform, one event type).
export type StatCount = { key: string; value: number }

// One day of the activations trend; `activations` is a discrete daily count.
export type ActivationDay = { date: string; activations: number }

// The shape of statistics.json — the Dashboard's single authoritative aggregate
// document (ADR-0001). `byVendor` / `byCountry` exist but are unused here.
export type Statistics = {
	generatedAt: string
	totals: {
		devices: number
		users: number
		activeDevices: number
		removedDevices: number
		expiredDevices: number
		blockedDevices: number
		events: number
	}
	byStatus: StatCount[]
	byPlatform: StatCount[]
	byVendor: StatCount[]
	byCountry: StatCount[]
	byEventType: StatCount[]
	activationsLast30Days: ActivationDay[]
}

export const statisticsQueryOptions = queryOptions({
	queryKey: ['statistics'],
	queryFn: () => fetchJson<Statistics>('statistics.json'),
})
