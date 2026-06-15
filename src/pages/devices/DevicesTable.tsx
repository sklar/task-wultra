import { Link, useNavigate } from '@tanstack/react-router'
import type { Device, DeviceSort, SortField } from '../../api/devices'
import { StatusBadge } from '../../components/StatusBadge'
import { Timestamp } from '../../components/Timestamp'

type Column = { label: string; sortField?: SortField }

// Only the two date columns are sortable (PAGES.md): categorical columns are filtered.
const COLUMNS: readonly Column[] = [
	{ label: 'Device' },
	{ label: 'Status' },
	{ label: 'Platform' },
	{ label: 'Last active', sortField: 'lastActiveAt' },
	{ label: 'Created', sortField: 'createdAt' },
]

export function DevicesTable({
	devices,
	sort,
	onToggleSort,
}: {
	devices: Device[]
	sort: DeviceSort
	onToggleSort: (field: SortField) => void
}) {
	return (
		<div className="overflow-x-auto">
			<table className="table-fixed w-full border-collapse text-sm">
				<thead>
					<tr className="border-border border-b text-left text-text-muted">
						{COLUMNS.map((column) => (
							<HeaderCell
								key={column.label}
								column={column}
								sort={sort}
								onToggleSort={onToggleSort}
							/>
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

function HeaderCell({
	column,
	sort,
	onToggleSort,
}: {
	column: Column
	sort: DeviceSort
	onToggleSort: (field: SortField) => void
}) {
	const field = column.sortField
	if (!field) {
		return <th className="px-3 py-2 font-medium">{column.label}</th>
	}
	const active = sort.field === field
	const ascending = sort.direction === 'asc'
	// aria-sort makes the current ordering announced to assistive tech.
	let ariaSort: 'ascending' | 'descending' | 'none' = 'none'
	if (active) {
		ariaSort = ascending ? 'ascending' : 'descending'
	}
	return (
		<th aria-sort={ariaSort} className="px-3 py-2 font-medium">
			<button
				type="button"
				onClick={() => onToggleSort(field)}
				className="flex items-center gap-1 hover:text-text"
			>
				{column.label}
				{active && (
					<span aria-hidden="true" className="text-xs">
						{ascending ? '▲' : '▼'}
					</span>
				)}
			</button>
		</th>
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
			<td className="px-3 py-2 text-text-muted tabular-nums">
				<Timestamp iso={device.lastActiveAt} />
			</td>
			<td className="px-3 py-2 text-text-muted tabular-nums">
				<Timestamp iso={device.createdAt} />
			</td>
		</tr>
	)
}
