import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/devices/$id')

export function DeviceDetailPage() {
	const { id } = routeApi.useParams()
	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold text-text">Device detail</h1>
			<p className="text-text-muted">
				Placeholder for device <code>{id}</code> — info and Event history land
				in a later slice.
			</p>
		</section>
	)
}
