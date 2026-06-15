import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { Device } from '../api/devices'
import {
	devicesQueryOptions,
	filterDevices,
	sortByLastActiveDesc,
} from '../api/devices'
import { AsyncState } from '../components/AsyncState'
import { StatusBadge } from '../components/StatusBadge'
import { Timestamp } from '../components/Timestamp'
import { STATUS_ORDER } from '../domain/status'

const route = getRouteApi('/devices')

// Devices (`/devices`): the full 120-item collection loaded once (ADR-0002), filtered
// and searched client-side. Filter/search state lives in typed URL search params so the
// view is shareable and survives refresh/back-forward. Sorting/pagination arrive in #05.
export function DevicesPage() {
	const query = useQuery(devicesQueryOptions)
	return (
		<section className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold text-text">Devices</h1>
			<AsyncState query={query} skeleton={<TableSkeleton />}>
				{(devices) => <DevicesView devices={devices} />}
			</AsyncState>
		</section>
	)
}

function DevicesView({ devices }: { devices: Device[] }) {
	const search = route.useSearch()
	const navigate = useNavigate({ from: '/devices' })

	const platforms = useMemo(
		() => distinct(devices.map((d) => d.platform)),
		[devices],
	)
	const vendors = useMemo(
		() => distinct(devices.map((d) => d.vendor)),
		[devices],
	)

	const visible = useMemo(
		() => sortByLastActiveDesc(filterDevices(devices, search)),
		[devices, search],
	)

	// Deliberate filter changes push a history entry; high-frequency search updates
	// replace so typing doesn't spam back/forward.
	function setFacet(key: 'status' | 'platform' | 'vendor', value: string) {
		navigate({
			search: (prev) => ({ ...prev, [key]: value || undefined }),
		})
	}
	function setSearch(value: string) {
		navigate({
			search: (prev) => ({ ...prev, search: value || undefined }),
			replace: true,
		})
	}
	// Resetting is deliberate, so it pushes a clean entry; offered only when there's
	// something to clear.
	const hasActiveFilters = Boolean(
		search.status || search.platform || search.vendor || search.search,
	)
	// #05: when sort/page join these search params, clear only the filter keys and
	// preserve sort + page — e.g. navigate({ search: ({ sort, page }) => ({ sort, page }) }).
	function clearFilters() {
		navigate({ search: {} })
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-end gap-4">
				<Facet
					id="filter-status"
					label="Status"
					value={search.status ?? ''}
					onChange={(v) => setFacet('status', v)}
					options={STATUS_ORDER}
					allLabel="All statuses"
				/>
				<Facet
					id="filter-platform"
					label="Platform"
					value={search.platform ?? ''}
					onChange={(v) => setFacet('platform', v)}
					options={platforms}
					allLabel="All platforms"
				/>
				<Facet
					id="filter-vendor"
					label="Vendor"
					value={search.vendor ?? ''}
					onChange={(v) => setFacet('vendor', v)}
					options={vendors}
					allLabel="All vendors"
				/>
				<div className="flex flex-col gap-1">
					<label htmlFor="search-devices" className="text-text-muted text-xs">
						Search
					</label>
					<input
						id="search-devices"
						type="search"
						value={search.search ?? ''}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="shortId, model, or user"
						className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
					/>
				</div>
				{hasActiveFilters && (
					<button
						type="button"
						onClick={clearFilters}
						className="rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
					>
						Clear filters
					</button>
				)}
			</div>
			{visible.length === 0 ? (
				<EmptyState />
			) : (
				<DevicesTable devices={visible} />
			)}
		</div>
	)
}

function distinct(values: string[]): string[] {
	return [...new Set(values)].sort()
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
				className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
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

// Shown when filters/search exclude every device (PAGES.md: a clear "no devices match").
function EmptyState() {
	return (
		<p className="rounded-md border border-border p-6 text-center text-text-muted">
			No devices match the current filters.
		</p>
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
			<td className="px-3 py-2 text-text-muted tabular-nums">
				<Timestamp iso={device.lastActiveAt} />
			</td>
			<td className="px-3 py-2 text-text-muted tabular-nums">
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
