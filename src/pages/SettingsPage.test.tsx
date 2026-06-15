import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE } from '../api/client'
import type { Device } from '../api/devices'
import { server } from '../mocks/server'
import { renderWithProviders } from '../test/render-with-providers'

// Scope to <main> so queries hit the Settings controls, not the header's own
// theme toggle (which is also labelled "Theme").
function settings() {
	return within(screen.getByRole('main'))
}

function device(shortId: string): Device {
	return {
		id: `id-${shortId}`,
		shortId,
		vendor: 'Apple',
		model: 'iPhone 14',
		platform: 'iOS',
		status: 'active',
		createdAt: '2025-03-15T10:00:00Z',
		lastActiveAt: '2026-01-14T10:00:00Z',
		user: { id: 'u-1', displayName: 'Pavel Procházka' },
	}
}

function serveDevices(items: Device[]) {
	server.use(
		http.get(`${API_BASE}/devices/index.json`, () =>
			HttpResponse.json({
				totalItems: items.length,
				totalPages: 1,
				pageSize: 25,
				items,
			}),
		),
	)
}

function dataRows() {
	return within(screen.getByRole('table'))
		.getAllByRole('row')
		.filter((row) => within(row).queryAllByRole('cell').length > 0)
}

describe('Settings page', () => {
	it('shows the three preference controls reflecting the current values', async () => {
		await renderWithProviders({ initialPath: '/settings' })
		await screen.findByRole('heading', { name: 'Settings' })

		// Defaults (ADR-0003): system theme, page size 25, absolute timestamps.
		expect(settings().getByLabelText('Theme')).toHaveValue('system')
		expect(settings().getByLabelText('Page size')).toHaveValue('25')
		expect(settings().getByLabelText('Timestamp format')).toHaveValue(
			'absolute',
		)
	})

	it('applies a theme choice live — recolors the app, persists, and the header toggle agrees', async () => {
		const { user } = await renderWithProviders({ initialPath: '/settings' })
		await screen.findByRole('heading', { name: 'Settings' })

		await user.selectOptions(settings().getByLabelText('Theme'), 'dark')

		// Applied to <html>, persisted to localStorage, and the same Context value drives
		// the header toggle (the shared-state consumer).
		expect(document.documentElement).toHaveClass('dark')
		expect(localStorage.getItem('wultra.theme')).toBe('dark')
		const header = within(screen.getByRole('banner'))
		expect(header.getByRole('button', { name: 'Dark' })).toHaveAttribute(
			'aria-pressed',
			'true',
		)
	})

	it('applies a page-size choice that persists and drives the devices table', async () => {
		serveDevices(Array.from({ length: 12 }, (_, i) => device(`d-${i + 1}`)))
		const { user } = await renderWithProviders({ initialPath: '/settings' })
		await screen.findByRole('heading', { name: 'Settings' })

		await user.selectOptions(settings().getByLabelText('Page size'), '10')
		expect(localStorage.getItem('wultra.pageSize')).toBe('10')

		// The devices table reads the live preference: 12 devices now split at 10 per page.
		await user.click(screen.getByRole('link', { name: 'Devices' }))
		await waitFor(() => expect(dataRows()).toHaveLength(10))
	})

	it('applies a timestamp-format choice that persists and reflects in every <time>', async () => {
		serveDevices([device('d-1')])
		const { user } = await renderWithProviders({ initialPath: '/settings' })
		await screen.findByRole('heading', { name: 'Settings' })

		await user.selectOptions(
			settings().getByLabelText('Timestamp format'),
			'relative',
		)
		expect(localStorage.getItem('wultra.timestampFormat')).toBe('relative')

		// The shared Timestamp consumer now renders relative text, ISO still on <time>.
		await user.click(screen.getByRole('link', { name: 'Devices' }))
		const relative = await screen.findAllByText(/ago$/)
		expect(relative[0].tagName).toBe('TIME')
	})
})
