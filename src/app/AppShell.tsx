import { HeadContent, Outlet } from '@tanstack/react-router'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'
import { OfflineSnackbar } from '../components/OfflineSnackbar'

// Persistent shell: header and footer wrap every route; only <main> swaps via the
// Outlet. <HeadContent /> renders each route's document title (router `head` API).
export function AppShell() {
	return (
		<>
			<HeadContent />
			<div className="flex min-h-screen flex-col">
				<AppHeader />
				<main className="flex-1 px-4 py-6">
					<Outlet />
				</main>
				<AppFooter />
			</div>
			<OfflineSnackbar />
		</>
	)
}
