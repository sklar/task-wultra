import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '../app/AppProviders'
import { createAppRouter } from '../app/router'
import { createTestQueryClient } from './test-query-client'

// Render the whole app through the real provider stack and a memory-history router,
// so tests exercise routing + Query + preferences exactly as production does. The
// network is mocked at the MSW boundary (the highest-value seam per the PRD).
export async function renderWithProviders({
	initialPath = '/',
}: {
	initialPath?: string
} = {}) {
	const queryClient = createTestQueryClient()
	const router = createAppRouter(
		createMemoryHistory({ initialEntries: [initialPath] }),
	)
	// Resolve the initial route match so the shell paints on first render.
	await router.load()
	const user = userEvent.setup()
	const result = render(
		<AppProviders queryClient={queryClient}>
			<RouterProvider router={router} />
		</AppProviders>,
	)
	return { ...result, user, queryClient, router }
}
