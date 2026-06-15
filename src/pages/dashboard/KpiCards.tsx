import type { Statistics } from '../../api/statistics'

type Kpi = { label: string; value: number }

function kpis(totals: Statistics['totals']): Kpi[] {
	return [
		{ label: 'Total devices', value: totals.devices },
		{ label: 'Active devices', value: totals.activeDevices },
		{ label: 'Users', value: totals.users },
		{ label: 'Total events', value: totals.events },
	]
}

// The four headline numbers, from the authoritative `totals` aggregate (ADR-0001).
export function KpiCards({ totals }: { totals: Statistics['totals'] }) {
	return (
		<ul aria-label="Fleet totals" className="area-kpis grid grid-cols-2 gap-4">
			{kpis(totals).map((kpi) => (
				<li
					key={kpi.label}
					className="flex flex-col gap-1 border border-border bg-surface-2 p-4"
				>
					<span className="text-2xl font-semibold text-text">{kpi.value}</span>
					<span className="text-sm text-text-muted">{kpi.label}</span>
				</li>
			))}
		</ul>
	)
}
