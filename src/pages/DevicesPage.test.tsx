import { onlineManager } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE } from '../api/client'
import type { Device } from '../api/devices'
import { server } from '../mocks/server'
import { renderWithProviders } from '../test/render-with-providers'

const DEVICES_URL = `${API_BASE}/devices/index.json`

function device(overrides: Partial<Device> = {}): Device {
	return {
		id: 'id-1',
		shortId: 'd-0001',
		vendor: 'Apple',
		model: 'iPhone 14',
		platform: 'iOS',
		status: 'active',
		createdAt: '2025-03-15T10:00:00Z',
		lastActiveAt: '2026-01-14T10:00:00Z',
		user: { id: 'u-1', displayName: 'Pavel Procházka' },
		...overrides,
	}
}

function collection(items: Device[]) {
	return {
		totalItems: items.length,
		totalPages: 1,
		pageSize: 25,
		items,
	}
}

// The data rows of the devices table (excludes the header row).
function dataRows() {
	const table = screen.getByRole('table')
	return within(table)
		.getAllByRole('row')
		.filter((row) => within(row).queryAllByRole('cell').length > 0)
}

describe('Devices table', () => {
	it('loads the collection once and renders a row per device, sorted by last-active descending', async () => {
		let calls = 0
		server.use(
			http.get(DEVICES_URL, () => {
				calls += 1
				return HttpResponse.json(
					collection([
						device({
							id: 'id-mid',
							shortId: 'd-mid',
							lastActiveAt: '2026-01-01T10:00:00Z',
						}),
						device({
							id: 'id-new',
							shortId: 'd-new',
							lastActiveAt: '2026-03-01T10:00:00Z',
						}),
						device({
							id: 'id-old',
							shortId: 'd-old',
							lastActiveAt: '2025-06-01T10:00:00Z',
						}),
					]),
				)
			}),
		)

		await renderWithProviders({ initialPath: '/devices' })

		await screen.findByText('d-new')
		const order = dataRows().map(
			(row) => within(row).getByText(/^d-/).textContent,
		)
		expect(order).toEqual(['d-new', 'd-mid', 'd-old'])
		// One request into one Query entry — no per-page or users fetches (ADR-0002).
		expect(calls).toBe(1)
	})

	it('shows the identity, status, platform, and both date columns for a device', async () => {
		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(
					collection([
						device({
							vendor: 'Samsung',
							model: 'Galaxy S24',
							shortId: 'd-0007',
							platform: 'Android',
							status: 'blocked',
							user: { id: 'u-9', displayName: 'Tereza Pospíšil' },
							createdAt: '2024-02-14T10:00:00Z',
							lastActiveAt: '2025-08-30T10:00:00Z',
						}),
					]),
				),
			),
		)

		await renderWithProviders({ initialPath: '/devices' })

		const row = (await screen.findAllByRole('row')).find(
			(r) => within(r).queryByText('d-0007') !== null,
		)
		if (!row) throw new Error('device row not found')
		const cells = within(row)
		// Identity cell: vendor · model, shortId, owning user displayName (plain text).
		expect(cells.getByText(/Samsung/)).toBeInTheDocument()
		expect(cells.getByText(/Galaxy S24/)).toBeInTheDocument()
		expect(cells.getByText('Tereza Pospíšil')).toBeInTheDocument()
		// Status badge + platform.
		expect(cells.getByText('blocked')).toBeInTheDocument()
		expect(cells.getByText('Android')).toBeInTheDocument()
		// Both dates render as semantic <time> carrying the ISO value.
		const times = row.querySelectorAll('time')
		const isos = Array.from(times).map((t) => t.getAttribute('dateTime'))
		expect(isos).toContain('2025-08-30T10:00:00Z')
		expect(isos).toContain('2024-02-14T10:00:00Z')
	})

	it('navigates to the device detail route when a row is clicked', async () => {
		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(
					collection([device({ id: 'device-xyz', shortId: 'd-0001' })]),
				),
			),
		)

		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})

		// The identity cell's link is named by the device (vendor · model).
		const link = await screen.findByRole('link', { name: /iPhone 14/ })
		await user.click(link)

		expect(router.state.location.pathname).toBe('/devices/device-xyz')
	})

	it('navigates when a non-link cell in the row is clicked', async () => {
		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(
					collection([device({ id: 'device-xyz', platform: 'Android' })]),
				),
			),
		)

		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})

		// The platform cell carries no link of its own; the whole row is clickable.
		const platformCell = await screen.findByText('Android')
		await user.click(platformCell)

		expect(router.state.location.pathname).toBe('/devices/device-xyz')
	})

	it('renders relative time with the absolute value in the title when the preference is relative', async () => {
		localStorage.setItem('wultra.timestampFormat', 'relative')
		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(
					collection([device({ lastActiveAt: '2020-01-01T10:00:00Z' })]),
				),
			),
		)

		await renderWithProviders({ initialPath: '/devices' })

		const lastActive = await screen.findByText(/years ago/)
		expect(lastActive.tagName).toBe('TIME')
		expect(lastActive).toHaveAttribute('title', expect.stringContaining('2020'))
	})

	it('shows a skeleton while loading, then the rows', async () => {
		server.use(
			http.get(DEVICES_URL, async () => {
				await delay(50)
				return HttpResponse.json(collection([device({ shortId: 'd-0001' })]))
			}),
		)

		await renderWithProviders({ initialPath: '/devices' })

		expect(await screen.findByLabelText('Loading')).toBeInTheDocument()
		expect(await screen.findByText('d-0001')).toBeInTheDocument()
	})

	it('shows an error with a Retry that recovers once the request succeeds', async () => {
		server.use(
			http.get(DEVICES_URL, () => new HttpResponse(null, { status: 500 })),
		)
		const { user } = await renderWithProviders({ initialPath: '/devices' })

		const alert = await screen.findByRole('alert')
		const retry = within(alert).getByRole('button', { name: /retry/i })

		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(collection([device({ shortId: 'd-0001' })])),
			),
		)
		await user.click(retry)

		expect(await screen.findByText('d-0001')).toBeInTheDocument()
	})

	it('shows the offline snackbar while keeping cached rows, then clears on reconnect', async () => {
		server.use(
			http.get(DEVICES_URL, () =>
				HttpResponse.json(collection([device({ shortId: 'd-0001' })])),
			),
		)
		await renderWithProviders({ initialPath: '/devices' })
		await screen.findByText('d-0001')

		act(() => onlineManager.setOnline(false))
		expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
		// Already-loaded rows stay visible beneath the snackbar.
		expect(screen.getByText('d-0001')).toBeInTheDocument()

		act(() => onlineManager.setOnline(true))
		await waitFor(() => {
			expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()
		})
	})
})
