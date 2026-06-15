import { createRootRoute, createRoute } from '@tanstack/react-router'
import { DashboardPage } from '../pages/DashboardPage'
import { DeviceDetailPage } from '../pages/DeviceDetailPage'
import { DevicesPage } from '../pages/DevicesPage'
import { SettingsPage } from '../pages/SettingsPage'
import { AppShell } from './AppShell'

const TITLE_SUFFIX = 'Wultra Device Dashboard'

function title(page: string) {
	return { meta: [{ title: `${page} · ${TITLE_SUFFIX}` }] }
}

const rootRoute = createRootRoute({ component: AppShell })

const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: DashboardPage,
	head: () => title('Dashboard'),
})

const devicesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/devices',
	component: DevicesPage,
	head: () => title('Devices'),
})

const deviceDetailRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/devices/$id',
	component: DeviceDetailPage,
	head: () => title('Device'),
})

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings',
	component: SettingsPage,
	head: () => title('Settings'),
})

export const routeTree = rootRoute.addChildren([
	dashboardRoute,
	devicesRoute,
	deviceDetailRoute,
	settingsRoute,
])
