import {
	VisAxis,
	VisDonut,
	VisGroupedBar,
	VisSingleContainer,
	VisTooltip,
	VisXYContainer,
} from '@unovis/react'
import { Donut, GroupedBar } from '@unovis/ts'
import type { Statistics } from '../../api/statistics'
import { STATUS_COLOR } from '../../domain/status-color'
import { ChartCard } from './ChartCard'
import type { ActivationDatum, BarDatum, StatusDatum } from './chart-data'
import {
	activationTickValues,
	toActivationsSeries,
	toBarSeries,
	toStatusSeries,
} from './chart-data'

const ACCENT = '#0099ff'

// One donut arc datum carries its source StatusDatum on `.data`.
type DonutArc = { data: StatusDatum }

export function StatusDonut({
	byStatus,
}: {
	byStatus: Statistics['byStatus']
}) {
	const series = toStatusSeries(byStatus)
	return (
		<ChartCard title="Devices by status" className="area-status">
			<div className="grid grid-cols-[2fr_1fr] items-center gap-4">
				<div>
					<VisSingleContainer data={series} height={200}>
						<VisDonut<StatusDatum>
							value={(d) => d.value}
							color={(d) => STATUS_COLOR[d.status]}
							arcWidth={40}
						/>
						<VisTooltip
							triggers={{
								[Donut.selectors.segment]: (d: DonutArc) =>
									`${d.data.status}: ${d.data.value}`,
							}}
						/>
					</VisSingleContainer>
				</div>
				<ul className="grid gap-1.5 justify-start text-sm">
					{series.map((datum) => (
						<li key={datum.status} className="flex items-center gap-2">
							<span
								aria-hidden="true"
								className="inline-block size-3 shrink-0 rounded-sm"
								style={{ background: STATUS_COLOR[datum.status] }}
							/>
							<span className="capitalize text-text">{datum.status}</span>
							<span className="ml-auto tabular-nums text-text-muted">
								{datum.value}
							</span>
						</li>
					))}
				</ul>
			</div>
		</ChartCard>
	)
}

// Horizontal bars grow with category count so labels stay legible (10 event types
// would be cramped at a fixed height). ~30px per row plus axis padding.
function HorizontalBar({ series }: { series: BarDatum[] }) {
	const height = Math.max(160, series.length * 30 + 32)
	return (
		<VisXYContainer data={series} height={height}>
			<VisGroupedBar<BarDatum>
				x={(_d, i) => i}
				y={(d) => d.value}
				orientation="horizontal"
				color={ACCENT}
			/>
			{/* Category labels down the left; the value axis (with its gridlines)
			    along the bottom. The category axis drops its own gridlines —
			    redundant once each bar sits on its labelled row. */}
			<VisAxis
				type="y"
				numTicks={series.length}
				tickFormat={(tick) => series[Number(tick)]?.key ?? ''}
				gridLine={false}
			/>
			<VisAxis type="x" />
			<VisTooltip
				triggers={{
					[GroupedBar.selectors.bar]: (d: BarDatum) => `${d.key}: ${d.value}`,
				}}
			/>
		</VisXYContainer>
	)
}

export function PlatformBar({
	byPlatform,
}: {
	byPlatform: Statistics['byPlatform']
}) {
	return (
		<ChartCard title="Devices by platform" className="area-platform">
			<HorizontalBar series={toBarSeries(byPlatform)} />
		</ChartCard>
	)
}

export function EventTypeBar({
	byEventType,
}: {
	byEventType: Statistics['byEventType']
}) {
	return (
		<ChartCard title="Events by type" className="area-events">
			<HorizontalBar series={toBarSeries(byEventType)} />
		</ChartCard>
	)
}

export function ActivationsBar({
	activationsLast30Days,
}: {
	activationsLast30Days: Statistics['activationsLast30Days']
}) {
	const series = toActivationsSeries(activationsLast30Days)
	return (
		<ChartCard title="Activations, last 30 days" className="area-activations">
			<VisXYContainer data={series} height={200}>
				<VisGroupedBar<ActivationDatum>
					x={(_d, i) => i}
					y={(d) => d.activations}
					color={ACCENT}
				/>
				<VisAxis
					type="x"
					numTicks={series.length}
					tickFormat={(tick) => series[Number(tick)]?.label ?? ''}
					gridLine={false}
				/>
				{/* Whole-number ticks only — activations are discrete counts. */}
				<VisAxis type="y" tickValues={activationTickValues(series)} />
				<VisTooltip
					triggers={{
						[GroupedBar.selectors.bar]: (d: ActivationDatum) =>
							`${d.date}: ${d.activations}`,
					}}
				/>
			</VisXYContainer>
		</ChartCard>
	)
}
