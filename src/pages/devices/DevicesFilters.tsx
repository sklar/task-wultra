import { STATUS_ORDER } from '../../domain/status'

type FacetKey = 'status' | 'platform' | 'vendor'

// The devices table's filter/search bar: three single-select facets (AND-combined) plus
// one free-text search (PAGES.md). Presentational — current values and option lists come
// in as props; changes are reported up to the container, which owns the URL state.
export function DevicesFilters({
	status,
	platform,
	vendor,
	search,
	platforms,
	vendors,
	hasActiveFilters,
	onFacetChange,
	onSearchChange,
	onClear,
}: {
	status: string
	platform: string
	vendor: string
	search: string
	platforms: readonly string[]
	vendors: readonly string[]
	hasActiveFilters: boolean
	onFacetChange: (key: FacetKey, value: string) => void
	onSearchChange: (value: string) => void
	onClear: () => void
}) {
	return (
		<div className="flex flex-wrap items-end gap-4">
			<Facet
				id="filter-status"
				label="Status"
				value={status}
				onChange={(v) => onFacetChange('status', v)}
				options={STATUS_ORDER}
				allLabel="All statuses"
			/>
			<Facet
				id="filter-platform"
				label="Platform"
				value={platform}
				onChange={(v) => onFacetChange('platform', v)}
				options={platforms}
				allLabel="All platforms"
			/>
			<Facet
				id="filter-vendor"
				label="Vendor"
				value={vendor}
				onChange={(v) => onFacetChange('vendor', v)}
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
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="shortId, model, or user"
					className="rounded-sm border border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
				/>
			</div>
			{hasActiveFilters && (
				<button
					type="button"
					onClick={onClear}
					className="rounded-sm border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
				>
					Clear filters
				</button>
			)}
		</div>
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
