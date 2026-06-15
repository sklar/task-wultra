import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/render-with-providers'

describe('App shell', () => {
	it('navigates between routes via the header nav, keeping the shell in place', async () => {
		const { user } = await renderWithProviders({ initialPath: '/' })

		expect(
			screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
		).toBeInTheDocument()

		await user.click(screen.getByRole('link', { name: 'Devices' }))
		expect(
			await screen.findByRole('heading', { level: 1, name: 'Devices' }),
		).toBeInTheDocument()

		// Header nav persists across the route change.
		expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
	})

	it('reaches the device detail route by url, reading its id param', async () => {
		await renderWithProviders({ initialPath: '/devices/abc-123' })

		expect(
			screen.getByRole('heading', { level: 1, name: 'Device detail' }),
		).toBeInTheDocument()
		expect(screen.getByText('abc-123')).toBeInTheDocument()
	})

	it('marks the active route in the nav', async () => {
		const { user } = await renderWithProviders({ initialPath: '/' })

		expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
			'aria-current',
			'page',
		)

		await user.click(screen.getByRole('link', { name: 'Settings' }))
		await screen.findByRole('heading', { level: 1, name: 'Settings' })

		expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
			'aria-current',
			'page',
		)
		expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
			'aria-current',
		)
	})

	it('persists the theme choice across reloads and reflects it on <html>', async () => {
		const { user, unmount } = await renderWithProviders()

		await user.click(screen.getByRole('button', { name: 'Light' }))
		expect(localStorage.getItem('wultra.theme')).toBe('light')
		expect(document.documentElement).toHaveClass('light')

		// Simulate a reload: a fresh render reads the persisted preference.
		unmount()
		await renderWithProviders()
		expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute(
			'aria-pressed',
			'true',
		)
	})

	it('shows the source links in the footer', async () => {
		await renderWithProviders()
		const footer = screen.getByRole('contentinfo')

		expect(
			within(footer).getByRole('link', { name: 'GitHub' }),
		).toHaveAttribute('href', expect.stringContaining('github.com'))
		expect(
			within(footer).getByRole('link', { name: 'Mock API' }),
		).toBeInTheDocument()
	})

	it('sets the document title per route via the head API', async () => {
		const { user } = await renderWithProviders({ initialPath: '/' })

		await waitFor(() =>
			expect(document.title).toBe('Dashboard · Wultra Device Dashboard'),
		)

		await user.click(screen.getByRole('link', { name: 'Devices' }))
		await waitFor(() =>
			expect(document.title).toBe('Devices · Wultra Device Dashboard'),
		)
	})
})
