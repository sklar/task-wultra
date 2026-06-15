import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreferencesProvider } from './PreferencesProvider'

// A controllable matchMedia: flips `matches` and notifies registered listeners,
// so we can simulate a live OS theme change.
function mockMatchMedia(initialDark: boolean) {
	let dark = initialDark
	const listeners = new Set<() => void>()
	window.matchMedia = (query: string): MediaQueryList => ({
		get matches() {
			return dark
		},
		media: query,
		onchange: null,
		addEventListener: (_type: string, cb: EventListenerOrEventListenerObject) =>
			listeners.add(cb as () => void),
		removeEventListener: (
			_type: string,
			cb: EventListenerOrEventListenerObject,
		) => listeners.delete(cb as () => void),
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	})
	return {
		setDark(next: boolean) {
			dark = next
			for (const cb of listeners) {
				cb()
			}
		},
	}
}

describe('PreferencesProvider theme slice', () => {
	it('follows the OS live when the preference is system (the default)', () => {
		const media = mockMatchMedia(false)
		render(
			<PreferencesProvider>
				<div />
			</PreferencesProvider>,
		)

		expect(document.documentElement).toHaveClass('light')

		media.setDark(true)
		expect(document.documentElement).toHaveClass('dark')
	})
})
