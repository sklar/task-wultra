import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { PreferencesProvider } from '../preferences/PreferencesProvider'

// The app-wide provider stack, shared by the entry point (src/main.tsx) and the test
// helper (src/test/render-with-providers.tsx) so adding a global provider is a single
// edit and prod can't drift from tests. The router is passed as children because it
// differs between the two (browser history in prod, memory history in tests).
export function AppProviders({
	queryClient,
	children,
}: {
	queryClient: QueryClient
	children: ReactNode
}) {
	return (
		<QueryClientProvider client={queryClient}>
			<PreferencesProvider>{children}</PreferencesProvider>
		</QueryClientProvider>
	)
}
