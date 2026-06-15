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
		await screen.findByRole('table')
		const platformCell = within(screen.getByRole('table')).getByText('Android')
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

describe('Devices filtering + search', () => {
	const mixed = [
		device({ id: 'id-a', shortId: 'd-a', status: 'active', platform: 'iOS' }),
		device({
			id: 'id-b',
			shortId: 'd-b',
			status: 'blocked',
			platform: 'Android',
			model: 'Galaxy S24',
		}),
		device({
			id: 'id-c',
			shortId: 'd-c',
			status: 'active',
			platform: 'Android',
			user: { id: 'u-9', displayName: 'Tereza Pospíšil' },
		}),
	]

	function serveMixed() {
		server.use(
			http.get(DEVICES_URL, () => HttpResponse.json(collection(mixed))),
		)
	}

	it('narrows the rows to the chosen status and reflects it in the URL', async () => {
		serveMixed()
		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})
		await screen.findByText('d-a')
		expect(dataRows()).toHaveLength(3)

		await user.selectOptions(screen.getByLabelText('Status'), 'blocked')

		await waitFor(() => expect(dataRows()).toHaveLength(1))
		expect(screen.getByText('d-b')).toBeInTheDocument()
		expect(router.state.location.search).toEqual({ status: 'blocked' })
	})

	it('narrows the rows to those matching the search text', async () => {
		serveMixed()
		const { user } = await renderWithProviders({ initialPath: '/devices' })
		await screen.findByText('d-a')

		await user.type(screen.getByLabelText('Search'), 'galaxy')

		await waitFor(() => expect(dataRows()).toHaveLength(1))
		expect(screen.getByText('d-b')).toBeInTheDocument()
	})

	it('shows the empty state when filters/search exclude every device', async () => {
		serveMixed()
		const { user } = await renderWithProviders({ initialPath: '/devices' })
		await screen.findByText('d-a')

		await user.type(screen.getByLabelText('Search'), 'no-such-device')

		expect(await screen.findByText(/no devices match/i)).toBeInTheDocument()
		expect(screen.queryByRole('table')).not.toBeInTheDocument()
	})

	it('applies filter + search from the initial URL (shareable / refresh-safe)', async () => {
		serveMixed()
		await renderWithProviders({
			initialPath: '/devices?status=active&platform=Android',
		})

		await waitFor(() => expect(dataRows()).toHaveLength(1))
		expect(screen.getByText('d-c')).toBeInTheDocument()
		// The controls pre-fill from the URL, so a shared link is self-describing.
		expect(screen.getByLabelText('Status')).toHaveValue('active')
		expect(screen.getByLabelText('Platform')).toHaveValue('Android')
	})

	it('offers Clear filters only when something is active, and resets everything', async () => {
		serveMixed()
		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})
		await screen.findByText('d-a')
		// Nothing applied yet — no reset affordance.
		expect(
			screen.queryByRole('button', { name: /clear filters/i }),
		).not.toBeInTheDocument()

		await user.selectOptions(screen.getByLabelText('Status'), 'blocked')
		await waitFor(() => expect(dataRows()).toHaveLength(1))

		await user.click(screen.getByRole('button', { name: /clear filters/i }))

		await waitFor(() => expect(dataRows()).toHaveLength(3))
		expect(router.state.location.search).toEqual({})
	})

	it('replaces history while searching, so one Back leaves the search behind', async () => {
		serveMixed()
		const { user, router } = await renderWithProviders({ initialPath: '/' })
		// Push Dashboard → Devices, then type several characters into search.
		await user.click(screen.getByRole('link', { name: 'Devices' }))
		await screen.findByText('d-a')
		await user.type(screen.getByLabelText('Search'), 'galaxy')
		await waitFor(() =>
			expect(router.state.location.search).toEqual({ search: 'galaxy' }),
		)

		// Each keystroke replaced rather than pushed, so a single Back is the Dashboard.
		router.history.back()
		await waitFor(() => expect(router.state.location.pathname).toBe('/'))
	})
})

describe('Devices sorting', () => {
	const byDates = [
		device({
			id: 'id-old-active',
			shortId: 'd-1',
			lastActiveAt: '2026-01-01T00:00:00Z',
			createdAt: '2025-12-01T00:00:00Z',
		}),
		device({
			id: 'id-new-active',
			shortId: 'd-2',
			lastActiveAt: '2026-05-01T00:00:00Z',
			createdAt: '2024-01-01T00:00:00Z',
		}),
	]

	function serveByDates() {
		server.use(
			http.get(DEVICES_URL, () => HttpResponse.json(collection(byDates))),
		)
	}

	function shortIdOrder() {
		return dataRows().map((row) => within(row).getByText(/^d-/).textContent)
	}

	it('toggles the createdAt sort and reflects field + direction in the URL', async () => {
		serveByDates()
		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})
		await screen.findByText('d-1')
		// Default is lastActiveAt descending: the most-recently-active device leads.
		expect(shortIdOrder()).toEqual(['d-2', 'd-1'])

		// First click on Created sorts by createdAt descending (newest-created first).
		await user.click(screen.getByRole('button', { name: /created/i }))
		await waitFor(() => expect(shortIdOrder()).toEqual(['d-1', 'd-2']))
		expect(router.state.location.search).toEqual({
			sort: 'createdAt',
			dir: 'desc',
		})

		// Clicking the same column again flips to ascending.
		await user.click(screen.getByRole('button', { name: /created/i }))
		await waitFor(() => expect(shortIdOrder()).toEqual(['d-2', 'd-1']))
		expect(router.state.location.search).toEqual({
			sort: 'createdAt',
			dir: 'asc',
		})
	})

	it('applies sort from the initial URL', async () => {
		serveByDates()
		await renderWithProviders({
			initialPath: '/devices?sort=createdAt&dir=asc',
		})
		await screen.findByText('d-1')
		// createdAt ascending: oldest-created (d-2, 2024) first.
		expect(shortIdOrder()).toEqual(['d-2', 'd-1'])
	})

	it('drops sort + direction from the URL when toggled back to the default', async () => {
		serveByDates()
		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})
		await screen.findByText('d-1')

		// Away from the default (lastActiveAt asc) writes the explicit state…
		await user.click(screen.getByRole('button', { name: /last active/i }))
		await waitFor(() =>
			expect(router.state.location.search).toEqual({
				sort: 'lastActiveAt',
				dir: 'asc',
			}),
		)

		// …and toggling back to the default (lastActiveAt desc) clears the params.
		await user.click(screen.getByRole('button', { name: /last active/i }))
		await waitFor(() => expect(router.state.location.search).toEqual({}))
	})
})

describe('Devices pagination', () => {
	// 12 devices, lastActiveAt descending d-01 (newest) … d-12 (oldest) so the default
	// sort gives a predictable order.
	const many = Array.from({ length: 12 }, (_, i) => {
		const n = String(i + 1).padStart(2, '0')
		const month = String(12 - i).padStart(2, '0')
		return device({
			id: `id-${n}`,
			shortId: `d-${n}`,
			lastActiveAt: `2026-${month}-01T00:00:00Z`,
		})
	})

	function serveMany() {
		server.use(http.get(DEVICES_URL, () => HttpResponse.json(collection(many))))
	}

	it('respects the page-size preference and navigates pages via the URL', async () => {
		// Page size is a localStorage preference (default 25); set 10 so 12 devices split.
		localStorage.setItem('wultra.pageSize', '10')
		serveMany()
		const { user, router } = await renderWithProviders({
			initialPath: '/devices',
		})
		await screen.findByText('d-01')

		// Page 1 shows exactly one page-size of rows, with "page X of Y".
		expect(dataRows()).toHaveLength(10)
		expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Next' }))

		// Page 2 holds the remainder; the page is reflected in the URL.
		await waitFor(() => expect(dataRows()).toHaveLength(2))
		expect(screen.getByText('d-11')).toBeInTheDocument()
		expect(router.state.location.search).toEqual({ page: 2 })

		// First returns to page 1 and drops the param (the clean default).
		await user.click(screen.getByRole('button', { name: 'First' }))
		await waitFor(() => expect(dataRows()).toHaveLength(10))
		expect(router.state.location.search).toEqual({})
	})

	it('opens a page directly from the URL', async () => {
		localStorage.setItem('wultra.pageSize', '10')
		serveMany()
		await renderWithProviders({ initialPath: '/devices?page=2' })

		await waitFor(() => expect(dataRows()).toHaveLength(2))
		expect(screen.getByText('d-11')).toBeInTheDocument()
	})
})
