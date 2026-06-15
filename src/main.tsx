import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/AppProviders'
import { queryClient } from './app/query-client'
import { createAppRouter } from './app/router'
import './index.css'

// MSW backs the dev server — it makes loading/error/offline states demoable against
// the always-up static API, and is the same handler set the tests use. Dev only: the
// `import.meta.env.DEV` guard keeps msw (and the mock) out of the production bundle so
// the deployed app hits the real API. Never throws, so render always proceeds.
async function enableMocking() {
	if (!import.meta.env.DEV) {
		return
	}
	try {
		const { worker } = await import('./mocks/browser')
		await worker.start({ onUnhandledRequest: 'bypass' })
	} catch (error) {
		console.error('Failed to start the MSW worker', error)
	}
}

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element #root not found')
}

const router = createAppRouter()

enableMocking().then(() => {
	createRoot(rootElement).render(
		<StrictMode>
			<AppProviders queryClient={queryClient}>
				<RouterProvider router={router} />
			</AppProviders>
		</StrictMode>,
	)
})
