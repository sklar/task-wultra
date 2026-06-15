import type { RouterHistory } from '@tanstack/react-router'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routes'

export function createAppRouter(history?: RouterHistory) {
	return createRouter({ routeTree, history, defaultPreload: 'intent' })
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createAppRouter>
	}
}
