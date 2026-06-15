import { onlineManager } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE } from '../api/client'
import { server } from '../mocks/server'
import { statisticsFixture } from '../mocks/statistics.fixture'
import { renderWithProviders } from '../test/render-with-providers'

// UnoVis (the D3/SVG chart marks) is stubbed app-wide in src/test/setup.ts — jsdom
// can't lay out SVG. Chart geometry is unit-tested as data (chart-data.test.ts);
// here we assert only the labelled figure containers our own code renders.

const statisticsOk = http.get(`${API_BASE}/statistics.json`, () =>
	HttpResponse.json(statisticsFixture),
)

describe('Dashboard', () => {
	it('renders the KPI values, the four charts, and the freshness line on success', async () => {
		await renderWithProviders({ initialPath: '/' })

		// KPI cards from `totals`. Scoped to the KPI list so values (e.g. 68 active)
		// don't collide with the status-donut legend, which also shows counts.
		await screen.findByText('Total devices')
		const kpis = within(screen.getByRole('list', { name: /fleet totals/i }))
		expect(kpis.getByText('Total devices')).toBeInTheDocument()
		expect(kpis.getByText('120')).toBeInTheDocument()
		expect(kpis.getByText('Active devices')).toBeInTheDocument()
		expect(kpis.getByText('68')).toBeInTheDocument()
		expect(kpis.getByText('Users')).toBeInTheDocument()
		expect(kpis.getByText('25')).toBeInTheDocument()
		expect(kpis.getByText('Total events')).toBeInTheDocument()
		expect(kpis.getByText('1849')).toBeInTheDocument()

		// All four chart containers, by accessible name.
		expect(
			screen.getByRole('figure', { name: /devices by status/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('figure', { name: /devices by platform/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('figure', { name: /events by type/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('figure', { name: /activations/i }),
		).toBeInTheDocument()

		// Freshness line near the charts.
		expect(screen.getByText(/statistics as of/i)).toBeInTheDocument()
	})

	it('shows a loading skeleton, then the resolved content', async () => {
		server.use(
			http.get(`${API_BASE}/statistics.json`, async () => {
				await delay(50)
				return HttpResponse.json(statisticsFixture)
			}),
		)
		await renderWithProviders({ initialPath: '/' })

		expect(await screen.findByLabelText('Loading')).toBeInTheDocument()
		expect(await screen.findByText('Total devices')).toBeInTheDocument()
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

		expect(await screen.findByText('Total devices')).toBeInTheDocument()
	})

	it('shows the offline snackbar while keeping cached content, then clears on reconnect', async () => {
		await renderWithProviders({ initialPath: '/' })
		await screen.findByText('Total devices')

		act(() => onlineManager.setOnline(false))
		expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
		// Already-loaded content stays visible beneath the snackbar.
		expect(screen.getByText('Total devices')).toBeInTheDocument()

		act(() => onlineManager.setOnline(true))
		await waitFor(() => {
			expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()
		})
	})
})
