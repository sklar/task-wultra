import type { ReactNode } from 'react'
import type { TimestampFormat } from '../lib/timestamp'
import { usePreferences } from '../preferences/PreferencesProvider'
import { PAGE_SIZES } from '../preferences/page-size'
import type { ThemePreference } from '../preferences/theme'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: 'system', label: 'System' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
]

const TIMESTAMP_OPTIONS: { value: TimestampFormat; label: string }[] = [
	{ value: 'absolute', label: 'Absolute' },
	{ value: 'relative', label: 'Relative' },
]

const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((size) => ({
	value: size,
	label: String(size),
}))

// The home for the localStorage preferences (ADR-0003). Each control writes straight
// through the PreferencesProvider setter — instant UI update + localStorage write, no
// Save button (the change is its own confirmation: theme recolors, timestamps reformat).
export function SettingsPage() {
	const {
		theme,
		setTheme,
		pageSize,
		setPageSize,
		timestampFormat,
		setTimestampFormat,
	} = usePreferences()

	return (
		<section className="flex max-w-md flex-col gap-6">
			<h1 className="font-semibold text-2xl text-text">Settings</h1>

			<Field id="settings-theme" label="Theme">
				<Select
					id="settings-theme"
					value={theme}
					options={THEME_OPTIONS}
					onChange={setTheme}
				/>
			</Field>

			<Field id="settings-page-size" label="Page size">
				<Select
					id="settings-page-size"
					value={pageSize}
					options={PAGE_SIZE_OPTIONS}
					onChange={setPageSize}
				/>
			</Field>

			<Field id="settings-timestamp" label="Timestamp format">
				<Select
					id="settings-timestamp"
					value={timestampFormat}
					options={TIMESTAMP_OPTIONS}
					onChange={setTimestampFormat}
				/>
			</Field>
		</section>
	)
}

function Field({
	id,
	label,
	children,
}: {
	id: string
	label: string
	children: ReactNode
}) {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id} className="text-sm text-text-muted">
				{label}
			</label>
			{children}
		</div>
	)
}

// A typed discrete-choice select: resolves the picked DOM string back to the exact
// option (the source of truth) before calling onChange, so the union type is preserved
// without an unchecked cast and an unrecognised value simply no-ops.
function Select<T extends string | number>({
	id,
	value,
	options,
	onChange,
}: {
	id: string
	value: T
	options: readonly { value: T; label: string }[]
	onChange: (value: T) => void
}) {
	return (
		<select
			id={id}
			value={value}
			onChange={(e) => {
				const picked = options.find((o) => String(o.value) === e.target.value)
				if (picked) {
					onChange(picked.value)
				}
			}}
			className="rounded-sm border border-border bg-surface-2 px-3 py-1.5 text-sm text-text"
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}
