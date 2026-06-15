import '@testing-library/jest-dom/vitest'
import { onlineManager } from '@tanstack/react-query'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { server } from '../mocks/server'

// UnoVis renders D3/SVG that jsdom can't lay out — its axis calls getBBox in a
// requestAnimationFrame and throws uncaught. Chart geometry isn't tested (chart
// data is unit-tested in chart-data.test.ts), so stub the chart marks app-wide:
// any test that renders the app gets inert containers instead of touching D3.
vi.mock('@unovis/react', () => ({
	VisSingleContainer: ({ children }: { children?: ReactNode }) => children,
	VisXYContainer: ({ children }: { children?: ReactNode }) => children,
	VisDonut: () => null,
	VisGroupedBar: () => null,
	VisAxis: () => null,
	VisTooltip: () => null,
}))

// jsdom doesn't implement scrollTo; the router calls it on navigation.
window.scrollTo = () => {}

// jsdom has no matchMedia; default to "light OS". Tests that exercise `system`
// theme resolution override this before rendering.
beforeEach(() => {
	window.matchMedia = (query: string): MediaQueryList => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	})
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
	cleanup()
	server.resetHandlers()
	onlineManager.setOnline(true)
	localStorage.clear()
	document.documentElement.className = ''
})

afterAll(() => server.close())
