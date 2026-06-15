import { describe, expect, it } from 'vitest'
import type { Device } from './devices'
import { filterDevices } from './devices'

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
