import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import type { Device } from '../api/devices'
import { devicesQueryOptions, sortByLastActiveDesc } from '../api/devices'
import { AsyncState } from '../components/AsyncState'
import { StatusBadge } from '../components/StatusBadge'
import { Timestamp } from '../components/Timestamp'

// Devices (`/devices`): the full 120-item collection loaded once (ADR-0002) and shown
// in a table, default-ordered most-recently-active first. Filtering/search (#04) and
// sorting/pagination (#05) build on this.
export function DevicesPage() {
	const query = useQuery(devicesQueryOptions)
	return (
		<section className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold text-text">Devices</h1>
			<AsyncState query={query} skeleton={<TableSkeleton />}>
				{(devices) => <DevicesTable devices={sortByLastActiveDesc(devices)} />}
			</AsyncState>
		</section>
	)
}

const COLUMNS = [
	'Device',
	'Status',
	'Platform',
	'Last active',
	'Created',
] as const

function DevicesTable({ devices }: { devices: Device[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-border border-b text-left text-text-muted">
						{COLUMNS.map((column) => (
							<th key={column} className="px-3 py-2 font-medium">
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{devices.map((device) => (
						<DeviceRow key={device.id} device={device} />
					))}
				</tbody>
			</table>
		</div>
	)
}

function DeviceRow({ device }: { device: Device }) {
	const navigate = useNavigate()
	// The whole row navigates to detail; the inner identity Link keeps the same target
	// reachable and focusable for keyboard/AT users (a bare clickable <tr> isn't).
	return (
		<tr
			onClick={() =>
				navigate({ to: '/devices/$id', params: { id: device.id } })
			}
			className="cursor-pointer border-border border-b last:border-b-0 hover:bg-surface-2"
		>
			<td className="px-3 py-2">
				<Link
					to="/devices/$id"
					params={{ id: device.id }}
					className="block hover:text-accent"
				>
					<span className="font-medium text-text">
						{device.vendor} · {device.model}
					</span>
				</Link>
				{/* Owning User as plain text — there is no Users page (CONTEXT.md). */}
				<div className="text-text-muted text-xs">{device.user.displayName}</div>
				<span className="block text-text-muted text-xs">{device.shortId}</span>
			</td>
			<td className="px-3 py-2">
				<StatusBadge status={device.status} />
			</td>
			<td className="px-3 py-2 text-text-muted">{device.platform}</td>
			<td className="px-3 py-2 text-text-muted">
				<Timestamp iso={device.lastActiveAt} />
			</td>
			<td className="px-3 py-2 text-text-muted">
				<Timestamp iso={device.createdAt} />
			</td>
		</tr>
	)
}

// Skeleton placeholder rows while the collection loads (PAGES.md: skeleton rows).
function TableSkeleton() {
	return (
		<div
			role="status"
			aria-busy="true"
			aria-label="Loading"
			className="flex flex-col gap-2"
		>
			{Array.from({ length: 8 }, (_, i) => i).map((row) => (
				<div key={row} className="h-10 animate-pulse rounded-md bg-surface-2" />
			))}
		</div>
	)
}
