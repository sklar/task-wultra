import { describe, expect, it } from 'vitest'
import type { Device, DeviceEvent } from './devices'
import {
	filterDevices,
	filterEvents,
	paginate,
	sortDevices,
	sortEventsNewestFirst,
} from './devices'

function device(overrides: Partial<Device> = {}): Device {
	return {
		id: 'id-1',
		shortId: 'd-0001',
		vendor: 'Apple',
		model: 'iPhone 14',
		platform: 'iOS',
		status: 'active',
		createdAt: '2025-03-15T10:00:00Z',
		lastActiveAt: '2026-01-14T10:00:00Z',
		user: { id: 'u-1', displayName: 'Pavel Procházka' },
		...overrides,
	}
}

describe('filterDevices', () => {
	it('keeps only devices matching every applied facet (AND-combined)', () => {
		const devices = [
			device({ id: 'a', status: 'active', platform: 'iOS' }),
			device({ id: 'b', status: 'blocked', platform: 'iOS' }),
			device({ id: 'c', status: 'active', platform: 'Android' }),
		]

		const result = filterDevices(devices, { status: 'active', platform: 'iOS' })

		expect(result.map((d) => d.id)).toEqual(['a'])
	})

	it('matches search against shortId, model, or user displayName, case-insensitively', () => {
		const byShortId = device({ id: 'a', shortId: 'd-0042' })
		const byModel = device({ id: 'b', shortId: 'd-0099', model: 'Galaxy S24' })
		const byUser = device({
			id: 'c',
			shortId: 'd-0100',
			user: { id: 'u-9', displayName: 'Tereza Pospíšil' },
		})
		const devices = [byShortId, byModel, byUser]

		expect(
			filterDevices(devices, { search: 'D-0042' }).map((d) => d.id),
		).toEqual(['a'])
		expect(
			filterDevices(devices, { search: 'galaxy' }).map((d) => d.id),
		).toEqual(['b'])
		expect(
			filterDevices(devices, { search: 'tereza' }).map((d) => d.id),
		).toEqual(['c'])
	})
})

describe('sortDevices', () => {
	const a = device({ id: 'a', lastActiveAt: '2026-01-01T00:00:00Z' })
	const b = device({ id: 'b', lastActiveAt: '2026-03-01T00:00:00Z' })
	const c = device({ id: 'c', lastActiveAt: '2025-06-01T00:00:00Z' })

	it('orders by the chosen date field, descending then ascending', () => {
		const devices = [a, b, c]

		expect(
			sortDevices(devices, { field: 'lastActiveAt', direction: 'desc' }).map(
				(d) => d.id,
			),
		).toEqual(['b', 'a', 'c'])
		expect(
			sortDevices(devices, { field: 'lastActiveAt', direction: 'asc' }).map(
				(d) => d.id,
			),
		).toEqual(['c', 'a', 'b'])
	})

	it('sorts by createdAt independently of lastActiveAt', () => {
		const devices = [
			device({ id: 'x', createdAt: '2024-01-01T00:00:00Z' }),
			device({ id: 'y', createdAt: '2025-01-01T00:00:00Z' }),
		]

		expect(
			sortDevices(devices, { field: 'createdAt', direction: 'desc' }).map(
				(d) => d.id,
			),
		).toEqual(['y', 'x'])
	})

	it('does not mutate the input array', () => {
		const devices = [a, b, c]
		sortDevices(devices, { field: 'lastActiveAt', direction: 'asc' })
		expect(devices.map((d) => d.id)).toEqual(['a', 'b', 'c'])
	})
})

function event(overrides: Partial<DeviceEvent> = {}): DeviceEvent {
	return {
		id: 'e-1',
		type: 'login',
		timestamp: '2025-11-10T09:03:00Z',
		ip: '25.206.173.205',
		location: 'Brno, CZ',
		result: 'success',
		...overrides,
	}
}

describe('sortEventsNewestFirst', () => {
	it('orders events by timestamp, newest first, regardless of input order', () => {
		const oldest = event({ id: 'a', timestamp: '2025-03-15T10:00:00Z' })
		const middle = event({ id: 'b', timestamp: '2025-09-16T19:15:00Z' })
		const newest = event({ id: 'c', timestamp: '2026-03-13T06:03:00Z' })

		const result = sortEventsNewestFirst([oldest, newest, middle])

		expect(result.map((e) => e.id)).toEqual(['c', 'b', 'a'])
	})

	it('does not mutate the input array', () => {
		const events = [
			event({ id: 'a', timestamp: '2025-03-15T10:00:00Z' }),
			event({ id: 'b', timestamp: '2026-03-13T06:03:00Z' }),
		]
		sortEventsNewestFirst(events)
		expect(events.map((e) => e.id)).toEqual(['a', 'b'])
	})
})

describe('filterEvents', () => {
	const events = [
		event({ id: 'a', type: 'login', result: 'success' }),
		event({ id: 'b', type: 'push_rejected', result: 'rejected' }),
		event({ id: 'c', type: 'login', result: 'rejected' }),
	]

	it('returns every event when no filter is applied', () => {
		expect(filterEvents(events, {}).map((e) => e.id)).toEqual(['a', 'b', 'c'])
	})

	it('narrows by type and by result (single-select, AND-combined)', () => {
		expect(filterEvents(events, { type: 'login' }).map((e) => e.id)).toEqual([
			'a',
			'c',
		])
		expect(
			filterEvents(events, { result: 'rejected' }).map((e) => e.id),
		).toEqual(['b', 'c'])
		expect(
			filterEvents(events, { type: 'login', result: 'rejected' }).map(
				(e) => e.id,
			),
		).toEqual(['c'])
	})
})

describe('paginate', () => {
	const items = Array.from({ length: 12 }, (_, i) => i + 1)

	it('returns the requested page slice and the total page count', () => {
		expect(paginate(items, 1, 5)).toEqual({
			items: [1, 2, 3, 4, 5],
			page: 1,
			totalPages: 3,
		})
		expect(paginate(items, 3, 5).items).toEqual([11, 12])
	})

	it('clamps an out-of-range page into the valid range', () => {
		expect(paginate(items, 99, 5).page).toBe(3)
		expect(paginate(items, 0, 5).page).toBe(1)
	})

	it('reports a single empty page for an empty collection', () => {
		expect(paginate([], 1, 25)).toEqual({ items: [], page: 1, totalPages: 1 })
	})
})

describe('filter → sort → paginate pipeline', () => {
	it('composes in order: filter narrows, sort orders, then a page is sliced', () => {
		const devices = [
			device({
				id: 'a',
				status: 'active',
				lastActiveAt: '2026-01-01T00:00:00Z',
			}),
			device({
				id: 'b',
				status: 'blocked',
				lastActiveAt: '2026-05-01T00:00:00Z',
			}),
			device({
				id: 'c',
				status: 'active',
				lastActiveAt: '2026-03-01T00:00:00Z',
			}),
			device({
				id: 'd',
				status: 'active',
				lastActiveAt: '2026-02-01T00:00:00Z',
			}),
		]

		const filtered = filterDevices(devices, { status: 'active' })
		const sorted = sortDevices(filtered, {
			field: 'lastActiveAt',
			direction: 'desc',
		})
		const result = paginate(sorted, 2, 2)

		// blocked 'b' is filtered out; the three active rows sort c, d, a desc; page 2
		// (size 2) is the remaining row.
		expect(result.items.map((d) => d.id)).toEqual(['a'])
		expect(result).toMatchObject({ page: 2, totalPages: 2 })
	})
})
