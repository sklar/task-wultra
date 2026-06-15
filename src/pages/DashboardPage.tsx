import { useQuery } from '@tanstack/react-query'
import { statisticsQueryOptions } from '../api/statistics'
import { AsyncState } from '../components/AsyncState'
import {
	ActivationsBar,
	EventTypeBar,
	PlatformBar,
	StatusDonut,
} from './dashboard/charts'
import { Freshness } from './dashboard/Freshness'
import { KpiCards } from './dashboard/KpiCards'

// Dashboard (`/`): fleet health and composition from the single statistics.json
// aggregate. Source (DOM) order is the mobile/SR reading order — KPIs → status →
// platform → event type → activations; the desktop grid reflows via grid-template-
// areas in index.css (never the `order` property). See PAGES.md.
export function DashboardPage() {
	const query = useQuery(statisticsQueryOptions)
	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold text-text">Dashboard</h1>
			<AsyncState query={query}>
				{(stats) => (
					<div className="flex flex-col gap-4">
						<div className="dashboard-grid">
							<KpiCards totals={stats.totals} />
							<StatusDonut byStatus={stats.byStatus} />
							<PlatformBar byPlatform={stats.byPlatform} />
							<EventTypeBar byEventType={stats.byEventType} />
							<ActivationsBar
								activationsLast30Days={stats.activationsLast30Days}
							/>
						</div>
						<Freshness generatedAt={stats.generatedAt} />
					</div>
				)}
			</AsyncState>
		</section>
	)
}
