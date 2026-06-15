import { describe, expect, it } from 'vitest'
import {
	activationTickValues,
	toActivationsSeries,
	toBarSeries,
	toStatusSeries,
} from './chart-data'

describe('toStatusSeries', () => {
	it('returns the four statuses in canonical order, including blocked', () => {
		const series = toStatusSeries([
			{ key: 'removed', value: 28 },
			{ key: 'active', value: 68 },
			{ key: 'blocked', value: 13 },
			{ key: 'expired', value: 11 },
		])

		expect(series).toEqual([
			{ status: 'active', value: 68 },
			{ status: 'blocked', value: 13 },
			{ status: 'expired', value: 11 },
			{ status: 'removed', value: 28 },
		])
	})

	it('defaults every status to zero when the aggregate is empty', () => {
		expect(toStatusSeries([])).toEqual([
			{ status: 'active', value: 0 },
			{ status: 'blocked', value: 0 },
			{ status: 'expired', value: 0 },
			{ status: 'removed', value: 0 },
		])
	})
})

describe('toBarSeries', () => {
	it('orders categories by descending value so the longest bar leads', () => {
		const series = toBarSeries([
			{ key: 'iOS', value: 35 },
			{ key: 'Android', value: 72 },
			{ key: 'iPadOS', value: 6 },
			{ key: 'HarmonyOS', value: 7 },
		])

		expect(series).toEqual([
			{ key: 'Android', value: 72 },
			{ key: 'iOS', value: 35 },
			{ key: 'HarmonyOS', value: 7 },
			{ key: 'iPadOS', value: 6 },
		])
	})

	it('returns an empty series for empty input', () => {
		expect(toBarSeries([])).toEqual([])
	})
})

describe('toActivationsSeries', () => {
	it('keeps one entry per day — sparse zeros included — labelled by day of month', () => {
		const series = toActivationsSeries([
			{ date: '2026-04-26', activations: 0 },
			{ date: '2026-04-27', activations: 1 },
			{ date: '2026-04-28', activations: 0 },
		])

		expect(series).toEqual([
			{ date: '2026-04-26', activations: 0, label: '26' },
			{ date: '2026-04-27', activations: 1, label: '27' },
			{ date: '2026-04-28', activations: 0, label: '28' },
		])
	})

	it('returns an empty series for empty input', () => {
		expect(toActivationsSeries([])).toEqual([])
	})
})

describe('activationTickValues', () => {
	it('produces only whole-number ticks from 0 to the peak (no fractional 0.5)', () => {
		const ticks = activationTickValues([
			{ date: '2026-04-26', activations: 0, label: '26' },
			{ date: '2026-04-27', activations: 1, label: '27' },
		])

		expect(ticks).toEqual([0, 1])
	})

	it('falls back to a single zero tick when there are no activations', () => {
		expect(
			activationTickValues([
				{ date: '2026-04-26', activations: 0, label: '26' },
			]),
		).toEqual([0])
		expect(activationTickValues([])).toEqual([0])
	})
})
