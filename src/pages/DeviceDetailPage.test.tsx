import { screen, waitFor, within } from '@testing-library/react'
import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE } from '../api/client'
import type { DeviceDetail, DeviceEvent } from '../api/devices'
import { server } from '../mocks/server'
import { renderWithProviders } from '../test/render-with-providers'

const DEVICE_ID = 'bdd640fb-0667-4ad1-9c80-317fa3b1799d'
const detailUrl = (id: string) => `${API_BASE}/devices/${id}.json`

function event(overrides: Partial<DeviceEvent> = {}): DeviceEvent {
	return {
		id: 'e-1',
		type: 'login',
		timestamp: '2025-11-10T09:03:00Z',
		ip: '25.206.173.205',
		location: 'Brno, CZ',
		result: 'success',
		...overrides,
	}
}

function detail(overrides: Partial<DeviceDetail> = {}): DeviceDetail {
	return {
		id: DEVICE_ID,
		shortId: 'd-0001',
		vendor: 'Apple',
		model: 'iPhone 14',
		platform: 'iOS',
		osVersion: '16.7',
		appVersion: '3.7.7',
		status: 'active',
		biometryEnabled: false,
		createdAt: '2025-03-15T10:00:00Z',
		lastActiveAt: '2026-01-14T10:00:00Z',
		user: { id: 'u-0022', displayName: 'Pavel Procházka' },
		events: [event()],
		...overrides,
	}
}

function serveDetail(d: DeviceDetail) {
	server.use(http.get(detailUrl(d.id), () => HttpResponse.json(d)))
}

// The data rows of the event-history table (excludes the header row).
function eventRows() {
	const table = screen.getByRole('table')
	return within(table)
		.getAllByRole('row')
		.filter((row) => within(row).queryAllByRole('cell').length > 0)
}

describe('Device detail', () => {
	it('renders the grouped info panel and the event history table on success', async () => {
		serveDetail(
			detail({
				vendor: 'Samsung',
				model: 'Galaxy S24',
				shortId: 'd-0007',
				platform: 'Android',
				osVersion: '14',
				appVersion: '3.8.0',
				status: 'blocked',
				biometryEnabled: true,
				user: { id: 'u-9', displayName: 'Tereza Pospíšil' },
				events: [
					event({
						id: 'e-old',
						type: 'activation',
						timestamp: '2025-01-01T10:00:00Z',
						result: 'success',
						location: 'Brno, CZ',
						ip: '10.0.0.1',
					}),
					event({
						id: 'e-new',
						type: 'push_rejected',
						timestamp: '2026-02-02T10:00:00Z',
						result: 'rejected',
						location: 'Berlin, DE',
						ip: '10.0.0.2',
					}),
				],
			}),
		)

		await renderWithProviders({ initialPath: `/devices/${DEVICE_ID}` })

		// Info panel — identity, software, lifecycle, user.
		expect(await screen.findByText('Galaxy S24')).toBeInTheDocument()
		expect(screen.getByText('d-0007')).toBeInTheDocument()
		expect(screen.getByText('3.8.0')).toBeInTheDocument()
		// Status is an authoritative badge; the user name is plain text.
		expect(screen.getByText('blocked')).toBeInTheDocument()
		expect(screen.getByText('Tereza Pospíšil')).toBeInTheDocument()

		// Event history — all events, newest-first, with the columns and the audit note.
		const order = eventRows().map(
			(row) => within(row).getByText(/activation|push_rejected/).textContent,
		)
		expect(order).toEqual(['push_rejected', 'activation'])
		expect(screen.getByText('Berlin, DE')).toBeInTheDocument()
		expect(screen.getByText('10.0.0.1')).toBeInTheDocument()
		expect(screen.getByText(/may not reflect/i)).toBeInTheDocument()
	})

	it('shows a not-found state when the id is unknown (404)', async () => {
		server.use(
			http.get(
				detailUrl(DEVICE_ID),
				() => new HttpResponse(null, { status: 404 }),
			),
		)

		await renderWithProviders({ initialPath: `/devices/${DEVICE_ID}` })

		expect(await screen.findByText(/device not found/i)).toBeInTheDocument()
		expect(screen.queryByRole('table')).not.toBeInTheDocument()
	})

	it('narrows the event rows when a type and a result filter are applied', async () => {
		serveDetail(
			detail({
				events: [
					event({ id: 'e-a', type: 'login', result: 'success' }),
					event({ id: 'e-b', type: 'push_rejected', result: 'rejected' }),
					event({ id: 'e-c', type: 'login', result: 'rejected' }),
				],
			}),
		)
		const { user } = await renderWithProviders({
			initialPath: `/devices/${DEVICE_ID}`,
		})
		await screen.findByRole('table')
		expect(eventRows()).toHaveLength(3)

		await user.selectOptions(screen.getByLabelText('Type'), 'login')
		await waitFor(() => expect(eventRows()).toHaveLength(2))

		await user.selectOptions(screen.getByLabelText('Result'), 'rejected')
		await waitFor(() => expect(eventRows()).toHaveLength(1))
		// The remaining row is the login that was rejected (e-c); push_rejected is gone.
		expect(eventRows()[0]).toHaveTextContent('login')
		expect(
			within(screen.getByRole('table')).queryByText('push_rejected'),
		).not.toBeInTheDocument()
	})

	it('sets the document title to {model} ({shortId}) once data resolves', async () => {
		serveDetail(detail({ model: 'Galaxy S24', shortId: 'd-0007' }))

		await renderWithProviders({ initialPath: `/devices/${DEVICE_ID}` })

		await waitFor(() =>
			expect(document.title).toBe(
				'Galaxy S24 (d-0007) · Wultra Device Dashboard',
			),
		)
	})

	it('shows a skeleton while loading, then the content', async () => {
		server.use(
			http.get(detailUrl(DEVICE_ID), async () => {
				await delay(50)
				return HttpResponse.json(detail({ model: 'iPhone 14' }))
			}),
		)

		await renderWithProviders({ initialPath: `/devices/${DEVICE_ID}` })

		expect(await screen.findByLabelText('Loading')).toBeInTheDocument()
		expect(await screen.findByText('iPhone 14')).toBeInTheDocument()
	})

	it('shows an error with a Retry that recovers once the request succeeds', async () => {
		server.use(
			http.get(
				detailUrl(DEVICE_ID),
				() => new HttpResponse(null, { status: 500 }),
			),
		)
		const { user } = await renderWithProviders({
			initialPath: `/devices/${DEVICE_ID}`,
		})

		const alert = await screen.findByRole('alert')
		const retry = within(alert).getByRole('button', { name: /retry/i })

		serveDetail(detail({ model: 'iPhone 14' }))
		await user.click(retry)

		expect(await screen.findByText('iPhone 14')).toBeInTheDocument()
	})
})
