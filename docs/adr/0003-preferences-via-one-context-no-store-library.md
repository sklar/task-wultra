# App-wide preferences via one React Context, backed by localStorage; no store library

We rejected a state-management library (Redux/Zustand): state has three homes — server state
in TanStack Query, navigation/filters in the URL, preferences in localStorage. But the three
preferences (theme, page size, timestamp format) are read and written from multiple places
and must stay in sync, live: theme from the header toggle, the Settings page, and applied to
`<html>`; page size from Settings and the devices table; timestamp format from Settings and
every `<time>` in the app.

**Decision:** A single small `PreferencesProvider` (React Context) holds all three prefs in
memory, persists them to localStorage, and exposes get/set. The theme slice additionally
applies the `<html>` class and, when `system`, listens to `prefers-color-scheme`.
**localStorage remains the home of truth; the Context is just the reactive in-memory carrier**
so multiple consumers stay in sync — not a fourth state home.

**Why this isn't a contradiction of "no global store":** what we rejected was a
state-management *library* for application data. A small Context for a cross-cutting UI
*preference* is the idiomatic React tool and a different thing entirely.

**Considered and rejected:** per-component `useLocalStorage` reads on mount — they wouldn't
keep the header toggle and Settings in sync live, and would scatter the same concern across
components. A store library — overkill for three enum-valued prefs.
