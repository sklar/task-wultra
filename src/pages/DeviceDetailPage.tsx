import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { isNotFoundError } from '../api/client'
import type { DeviceDetail } from '../api/devices'
import { deviceDetailQueryOptions } from '../api/devices'
import { AsyncState } from '../components/AsyncState'
import { useDocumentTitle } from '../lib/use-document-title'
import { DeviceInfoPanel } from './device-detail/DeviceInfoPanel'
import { EventHistory } from './device-detail/EventHistory'

const routeApi = getRouteApi('/devices/$id')

// Device detail (`/devices/$id`): one device's info + its full Event history, fetched
// by id via Query (PAGES.md). An unknown id (404) gets a dedicated not-found state,
// distinct from the generic error + Retry path; everything else flows through the shared
// async-state wrapper.
export function DeviceDetailPage() {
	const { id } = routeApi.useParams()
	const query = useQuery(deviceDetailQueryOptions(id))

	if (query.isError && isNotFoundError(query.error)) {
		return <NotFound />
	}

	return (
		<AsyncState query={query} skeleton={<DetailSkeleton />}>
			{(device) => <DeviceDetailView device={device} />}
		</AsyncState>
	)
}

function DeviceDetailView({ device }: { device: DeviceDetail }) {
	// The dynamic title is set component-side once the query resolves, since the data
	// lives in the Query cache, not a router loader (PAGES.md).
	useDocumentTitle(
		`${device.model} (${device.shortId}) · Wultra Device Dashboard`,
	)
	return (
		<section className="flex flex-col gap-6">
			<h1 className="font-semibold text-2xl text-text">
				{device.vendor} {device.model}
			</h1>
			<DeviceInfoPanel device={device} />
			<EventHistory events={device.events} />
		</section>
	)
}

// A bad link (unknown id) fails gracefully (PAGES.md) with a clear message and a way
// back to the list.
function NotFound() {
	return (
		<section className="flex flex-col items-start gap-6">
			<h1 className="font-semibold text-2xl text-text">Device not found</h1>
			<p className="text-text-muted">
				No device matches this link. It may have been removed, or the address
				may be wrong.
			</p>
			<Link to="/devices" className="text-accent hover:underline">
				Back to devices
			</Link>
		</section>
	)
}

// Skeleton blocks while the detail loads (PAGES.md: blocks on Detail).
function DetailSkeleton() {
	return (
		<div
			role="status"
			aria-busy="true"
			aria-label="Loading"
			className="flex flex-col gap-6"
		>
			<div className="h-8 w-64 animate-pulse rounded-sm bg-surface-2" />
			<div className="h-40 animate-pulse rounded-sm bg-surface-2" />
			<div className="h-64 animate-pulse rounded-sm bg-surface-2" />
		</div>
	)
}
