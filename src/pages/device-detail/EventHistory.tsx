import { useMemo, useState } from 'react'
import type { DeviceEvent, EventResult } from '../../api/devices'
import { filterEvents, sortEventsNewestFirst } from '../../api/devices'
import { Timestamp } from '../../components/Timestamp'
import { RESULT_COLOR } from '../../domain/result-color'

// The full Event history as a table (PAGES.md): all events, newest-first, with `type`,
// `timestamp`, `result` (colour-coded), `location`, `ip`. Filters by `type` and
// `result` are single-select and held in local component state — a transient in-page
// refinement, not URL state. No sort, no in-page search (all events render).
export function EventHistory({ events }: { events: DeviceEvent[] }) {
	const [type, setType] = useState('')
	const [result, setResult] = useState('')

	// Filter options come from the events themselves so only present types are offered.
	const types = useMemo(
		() => [...new Set(events.map((e) => e.type))].sort(),
		[events],
	)

	const rows = useMemo(() => {
		const ordered = sortEventsNewestFirst(events)
		return filterEvents(ordered, {
			type: type || undefined,
			result: (result || undefined) as EventResult | undefined,
		})
	}, [events, type, result])

	return (
		<section className="flex flex-col gap-4">
			<h2 className="font-semibold text-text text-xl">Event history</h2>
			<p className="text-text-muted text-xs">
				This is a display-only audit log and may not reflect the device's
				current status.
			</p>
			<div className="flex flex-wrap items-end gap-4">
				<Facet
					id="event-type"
					label="Type"
					value={type}
					onChange={setType}
					options={types}
					allLabel="All types"
				/>
				<Facet
					id="event-result"
					label="Result"
					value={result}
					onChange={setResult}
					options={['success', 'rejected']}
					allLabel="All results"
				/>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-border border-b text-left text-text-muted">
							<th className="px-3 py-2 font-medium">Type</th>
							<th className="px-3 py-2 font-medium">Timestamp</th>
							<th className="px-3 py-2 font-medium">Result</th>
							<th className="px-3 py-2 font-medium">Location</th>
							<th className="px-3 py-2 font-medium">IP</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((e) => (
							<tr key={e.id} className="border-border border-b last:border-b-0">
								<td className="px-3 py-2 text-text">{e.type}</td>
								<td className="px-3 py-2 text-text-muted tabular-nums">
									<Timestamp iso={e.timestamp} />
								</td>
								<td className="px-3 py-2 font-medium">
									<span style={{ color: RESULT_COLOR[e.result] }}>
										{e.result}
									</span>
								</td>
								<td className="px-3 py-2 text-text-muted">{e.location}</td>
								<td className="px-3 py-2 text-text-muted tabular-nums">
									{e.ip}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{rows.length === 0 && (
					<p className="p-4 text-center text-text-muted">
						No events match these filters.
					</p>
				)}
			</div>
		</section>
	)
}

function Facet({
	id,
	label,
	value,
	onChange,
	options,
	allLabel,
}: {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
	options: readonly string[]
	allLabel: string
}) {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id} className="text-text-muted text-xs">
				{label}
			</label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="rounded-sm border border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
			>
				<option value="">{allLabel}</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	)
}
