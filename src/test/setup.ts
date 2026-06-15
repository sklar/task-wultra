import '@testing-library/jest-dom/vitest'
import { onlineManager } from '@tanstack/react-query'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server } from '../mocks/server'

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
