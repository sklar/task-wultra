import { useQuery } from '@tanstack/react-query'
import { sampleQueryOptions } from '../api/sample'
import { AsyncState } from '../components/AsyncState'

// Placeholder body. The sample query exercises the data layer end-to-end
// (skeleton → error + Retry → content); real KPIs and charts land in a later slice.
export function DashboardPage() {
	const query = useQuery(sampleQueryOptions)
	return (
		<section className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold text-text">Dashboard</h1>
			<p className="text-text-muted">
				Placeholder — KPIs and charts land in a later slice.
			</p>
			<AsyncState query={query}>
				{(data) => (
					<p className="text-text">
						Data layer check: fetched {data.totals.devices} devices.
					</p>
				)}
			</AsyncState>
		</section>
	)
}
