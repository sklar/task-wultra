export type ThemePreference = 'dark' | 'light' | 'system'
export type EffectiveTheme = 'dark' | 'light'

// Resolve the preference to the theme actually applied: `system` follows the OS,
// an explicit `dark`/`light` overrides it.
export function resolveTheme(
	preference: ThemePreference,
	systemPrefersDark: boolean,
): EffectiveTheme {
	if (preference === 'system') {
		return systemPrefersDark ? 'dark' : 'light'
	}
	return preference
}
