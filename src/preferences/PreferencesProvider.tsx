import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { TimestampFormat } from '../lib/timestamp'
import type { PageSize } from './page-size'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from './page-size'
import type { ThemePreference } from './theme'
import { resolveTheme } from './theme'

const STORAGE_KEY = 'wultra.theme'
const TIMESTAMP_FORMAT_KEY = 'wultra.timestampFormat'
const PAGE_SIZE_KEY = 'wultra.pageSize'
const DARK_QUERY = '(prefers-color-scheme: dark)'

type PreferencesContextValue = {
	theme: ThemePreference
	setTheme: (theme: ThemePreference) => void
	timestampFormat: TimestampFormat
	setTimestampFormat: (format: TimestampFormat) => void
	pageSize: PageSize
	setPageSize: (size: PageSize) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'dark' || value === 'light' || value === 'system'
}

function isTimestampFormat(value: unknown): value is TimestampFormat {
	return value === 'absolute' || value === 'relative'
}

function isPageSize(value: unknown): value is PageSize {
	return PAGE_SIZES.includes(value as PageSize)
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

// Timestamp format default is `absolute` (PAGES.md / Settings).
function readStoredTimestampFormat(): TimestampFormat {
	try {
		const stored = localStorage.getItem(TIMESTAMP_FORMAT_KEY)
		return isTimestampFormat(stored) ? stored : 'absolute'
	} catch {
		return 'absolute'
	}
}

// Page size default is 25 (PAGES.md / ADR-0002). Stored as its numeric string.
function readStoredPageSize(): PageSize {
	try {
		const stored = Number(localStorage.getItem(PAGE_SIZE_KEY))
		return isPageSize(stored) ? stored : DEFAULT_PAGE_SIZE
	} catch {
		return DEFAULT_PAGE_SIZE
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
	const [timestampFormat, setTimestampFormatState] = useState<TimestampFormat>(
		readStoredTimestampFormat,
	)
	const [pageSize, setPageSizeState] = useState<PageSize>(readStoredPageSize)
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

	const setTimestampFormat = (next: TimestampFormat) => {
		try {
			localStorage.setItem(TIMESTAMP_FORMAT_KEY, next)
		} catch {
			// Persisting is best-effort; ignore storage failures and keep the UI in sync.
		}
		setTimestampFormatState(next)
	}

	const setPageSize = (next: PageSize) => {
		try {
			localStorage.setItem(PAGE_SIZE_KEY, String(next))
		} catch {
			// Persisting is best-effort; ignore storage failures and keep the UI in sync.
		}
		setPageSizeState(next)
	}

	return (
		<PreferencesContext.Provider
			value={{
				theme,
				setTheme,
				timestampFormat,
				setTimestampFormat,
				pageSize,
				setPageSize,
			}}
		>
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
