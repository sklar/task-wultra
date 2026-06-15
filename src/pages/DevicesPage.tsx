import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { Device, SortField } from '../api/devices'
import {
	DEFAULT_SORT,
	devicesQueryOptions,
	filterDevices,
	paginate,
	resolveSort,
	sortDevices,
} from '../api/devices'
import { AsyncState } from '../components/AsyncState'
import { usePreferences } from '../preferences/PreferencesProvider'
import { DevicesFilters } from './devices/DevicesFilters'
import { DevicesTable } from './devices/DevicesTable'
import { Pagination } from './devices/Pagination'

const route = getRouteApi('/devices')

// Devices (`/devices`): the full 120-item collection loaded once (ADR-0002), then run
// client-side through the filter → sort → paginate pipeline. Filter, sort, and page live
// in typed URL search params (shareable, back/forward-safe); page size is a localStorage
// preference read from the Context.
export function DevicesPage() {
	const query = useQuery(devicesQueryOptions)
	return (
		<section className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold text-text">Devices</h1>
			<AsyncState query={query} skeleton={<TableSkeleton />}>
				{(devices) => <DevicesView devices={devices} />}
			</AsyncState>
		</section>
	)
}

// The stateful container: owns the URL state and runs the pipeline, then hands plain data
// + callbacks to the presentational filter bar, table, and pagination.
function DevicesView({ devices }: { devices: Device[] }) {
	const search = route.useSearch()
	const navigate = useNavigate({ from: '/devices' })
	const { pageSize } = usePreferences()

	const platforms = useMemo(
		() => distinct(devices.map((d) => d.platform)),
		[devices],
	)
	const vendors = useMemo(
		() => distinct(devices.map((d) => d.vendor)),
		[devices],
	)

	const { field, direction } = resolveSort(search)

	// The pipeline, in order: filter narrows, sort orders, paginate slices the page.
	const filtered = useMemo(
		() => filterDevices(devices, search),
		[devices, search],
	)
	const sorted = useMemo(
		() => sortDevices(filtered, { field, direction }),
		[filtered, field, direction],
	)
	const page = useMemo(
		() => paginate(sorted, search.page ?? 1, pageSize),
		[sorted, search.page, pageSize],
	)

	// Deliberate filter changes push a history entry; high-frequency search updates
	// replace so typing doesn't spam back/forward. Changing what's shown resets to page 1.
	function setFacet(key: 'status' | 'platform' | 'vendor', value: string) {
		navigate({
			search: (prev) => ({
				...prev,
				[key]: value || undefined,
				page: undefined,
			}),
		})
	}
	function setSearch(value: string) {
		navigate({
			search: (prev) => ({
				...prev,
				search: value || undefined,
				page: undefined,
			}),
			replace: true,
		})
	}
	// Clicking a sortable column toggles direction when it's already active, otherwise
	// starts the new field descending (most-recent / newest first for dates). Re-sorting
	// returns to page 1.
	function toggleSort(target: SortField) {
		navigate({
			search: (prev) => {
				const current = resolveSort(prev)
				const nextDirection =
					current.field === target && current.direction === 'desc'
						? 'asc'
						: 'desc'
				// Drop sort/dir from the URL when they match the default, keeping it tidy
				// (resolveSort falls back to the default, so the display is unchanged).
				const isDefault =
					target === DEFAULT_SORT.field &&
					nextDirection === DEFAULT_SORT.direction
				return {
					...prev,
					sort: isDefault ? undefined : target,
					dir: isDefault ? undefined : nextDirection,
					page: undefined,
				}
			},
		})
	}
	function goToPage(next: number) {
		navigate({
			search: (prev) => ({ ...prev, page: next <= 1 ? undefined : next }),
		})
	}

	// Resetting filters is deliberate, so it pushes a clean entry; offered only when
	// there's something to clear. Sort + page are navigation, not filters — preserved.
	const hasActiveFilters = Boolean(
		search.status || search.platform || search.vendor || search.search,
	)
	function clearFilters() {
		navigate({
			search: ({ sort, dir, page: current }) => ({ sort, dir, page: current }),
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<DevicesFilters
				status={search.status ?? ''}
				platform={search.platform ?? ''}
				vendor={search.vendor ?? ''}
				search={search.search ?? ''}
				platforms={platforms}
				vendors={vendors}
				hasActiveFilters={hasActiveFilters}
				onFacetChange={setFacet}
				onSearchChange={setSearch}
				onClear={clearFilters}
			/>
			{filtered.length === 0 ? (
				<EmptyState />
			) : (
				<>
					<DevicesTable
						devices={page.items}
						sort={{ field, direction }}
						onToggleSort={toggleSort}
					/>
					<Pagination
						page={page.page}
						totalPages={page.totalPages}
						onGoTo={goToPage}
					/>
				</>
			)}
		</div>
	)
}

function distinct(values: string[]): string[] {
	return [...new Set(values)].sort()
}

// Shown when filters/search exclude every device (PAGES.md: a clear "no devices match").
function EmptyState() {
	return (
		<p className="rounded-sm border border-border p-6 text-center text-text-muted">
			No devices match the current filters.
		</p>
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
				<div key={row} className="h-10 animate-pulse rounded-sm bg-surface-2" />
			))}
		</div>
	)
}
