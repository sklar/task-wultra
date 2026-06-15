import { onlineManager } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE } from '../api/client'
import { server } from '../mocks/server'
import { renderWithProviders } from '../test/render-with-providers'

const statisticsOk = http.get(`${API_BASE}/statistics.json`, () =>
	HttpResponse.json({ totals: { devices: 120 } }),
)

describe('Dashboard async states (via the sample query)', () => {
	it('shows a loading skeleton, then the resolved content', async () => {
		server.use(
			http.get(`${API_BASE}/statistics.json`, async () => {
				await delay(50)
				return HttpResponse.json({ totals: { devices: 120 } })
			}),
		)
		await renderWithProviders({ initialPath: '/' })

		expect(await screen.findByLabelText('Loading')).toBeInTheDocument()
		expect(await screen.findByText(/fetched 120 devices/i)).toBeInTheDocument()
	})

	it('shows an error with a Retry action that recovers once the request succeeds', async () => {
		server.use(
			http.get(
				`${API_BASE}/statistics.json`,
				() => new HttpResponse(null, { status: 500 }),
			),
		)
		const { user } = await renderWithProviders({ initialPath: '/' })

		const alert = await screen.findByRole('alert')
		const retry = within(alert).getByRole('button', { name: /retry/i })

		server.use(statisticsOk)
		await user.click(retry)

		expect(await screen.findByText(/fetched 120 devices/i)).toBeInTheDocument()
	})

	it('shows the offline snackbar while keeping cached content, then clears on reconnect', async () => {
		await renderWithProviders({ initialPath: '/' })
		await screen.findByText(/fetched 120 devices/i)

		act(() => onlineManager.setOnline(false))
		expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
		// Already-loaded content stays visible beneath the snackbar.
		expect(screen.getByText(/fetched 120 devices/i)).toBeInTheDocument()

		act(() => onlineManager.setOnline(true))
		await waitFor(() => {
			expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()
		})
	})
})
