import { usePreferences } from '../preferences/PreferencesProvider'
import type { ThemePreference } from '../preferences/theme'

const OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: 'system', label: 'System' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
]

// Header theme control: a small segmented control driving the shared Context.
// Both this and the (later) Settings control write through the same setter.
export function ThemeToggle() {
	const { theme, setTheme } = usePreferences()
	return (
		<fieldset
			aria-label="Theme"
			className="m-0 flex min-w-0 gap-1 rounded-sm border border-border p-0.5"
		>
			{OPTIONS.map((option) => {
				const isActive = theme === option.value
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => setTheme(option.value)}
						className={
							isActive
								? 'rounded px-2 py-1 text-sm font-medium bg-accent text-white'
								: 'rounded px-2 py-1 text-sm text-text-muted'
						}
					>
						{option.label}
					</button>
				)
			})}
		</fieldset>
	)
}
