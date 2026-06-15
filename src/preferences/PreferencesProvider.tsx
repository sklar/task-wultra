import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ThemePreference } from './theme'
import { resolveTheme } from './theme'

const STORAGE_KEY = 'wultra.theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

type PreferencesContextValue = {
	theme: ThemePreference
	setTheme: (theme: ThemePreference) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'dark' || value === 'light' || value === 'system'
}

// localStorage is the home of truth (ADR-0003); read the persisted choice on init,
// defaulting to `system`.
function readStoredTheme(): ThemePreference {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return isThemePreference(stored) ? stored : 'system'
	} catch {
		// Storage unavailable (private mode / disabled by policy): fall back to default.
		return 'system'
	}
}

function applyTheme(theme: ThemePreference): void {
	const prefersDark = window.matchMedia(DARK_QUERY).matches
	const effective = resolveTheme(theme, prefersDark)
	const root = document.documentElement
	root.classList.remove('dark', 'light')
	root.classList.add(effective)
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme)
	const themeRef = useRef(theme)
	themeRef.current = theme

	// Apply whenever the preference changes.
	useEffect(() => {
		applyTheme(theme)
	}, [theme])

	// Subscribe to OS changes once (not on every toggle); re-apply only while the
	// preference is `system` — an explicit dark/light choice ignores the OS.
	useEffect(() => {
		const media = window.matchMedia(DARK_QUERY)
		const onChange = () => {
			if (themeRef.current === 'system') {
				applyTheme('system')
			}
		}
		media.addEventListener('change', onChange)
		return () => media.removeEventListener('change', onChange)
	}, [])

	const setTheme = (next: ThemePreference) => {
		try {
			localStorage.setItem(STORAGE_KEY, next)
		} catch {
			// Persisting is best-effort; ignore storage failures and keep the UI in sync.
		}
		setThemeState(next)
	}

	return (
		<PreferencesContext.Provider value={{ theme, setTheme }}>
			{children}
		</PreferencesContext.Provider>
	)
}

export function usePreferences(): PreferencesContextValue {
	const context = useContext(PreferencesContext)
	if (!context) {
		throw new Error('usePreferences must be used within a PreferencesProvider')
	}
	return context
}
