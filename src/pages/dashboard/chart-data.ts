import type { ActivationDay, StatCount } from '../../api/statistics'
import type { Status } from '../../domain/status'
import { STATUS_ORDER } from '../../domain/status'

export type StatusDatum = { status: Status; value: number }

// Shape `byStatus` into a fixed four-row series in canonical order, defaulting any
// missing Status to 0 so the donut always shows all four.
export function toStatusSeries(byStatus: StatCount[]): StatusDatum[] {
	const counts = new Map(byStatus.map((row) => [row.key, row.value]))
	return STATUS_ORDER.map((status) => ({
		status,
		value: counts.get(status) ?? 0,
	}))
}

export type BarDatum = { key: string; value: number }

// Shape a category aggregate (platform, event type) into a horizontal-bar series,
// ordered by descending value so the longest bar reads first.
export function toBarSeries(counts: StatCount[]): BarDatum[] {
	return counts
		.map((row) => ({ key: row.key, value: row.value }))
		.sort((a, b) => b.value - a.value)
}

export type ActivationDatum = {
	date: string
	activations: number
	label: string
}

// Shape the 30-day activations trend into one bar per day, in source (chronological)
// order. Sparse zero-days are kept verbatim — the series is shown honestly, never
// interpolated (PAGES.md). `label` is the day of month for the axis tick.
export function toActivationsSeries(days: ActivationDay[]): ActivationDatum[] {
	return days.map((day) => ({
		date: day.date,
		activations: day.activations,
		label: day.date.slice(8, 10),
	}))
}

// Whole-number y-axis ticks for the activations bar — activations are discrete event
// counts, so an auto-scaled "0.5" tick would be meaningless. Returns 0..peak.
export function activationTickValues(series: ActivationDatum[]): number[] {
	const peak = series.reduce(
		(max, datum) => Math.max(max, datum.activations),
		0,
	)
	return Array.from({ length: peak + 1 }, (_, i) => i)
}
