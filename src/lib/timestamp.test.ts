import { describe, expect, it } from 'vitest'
import { formatTimestamp } from './timestamp'

describe('formatTimestamp', () => {
	it('renders an absolute, human date with no title in absolute mode', () => {
		const now = new Date('2026-06-15T10:00:00Z')
		const result = formatTimestamp('2026-01-14T10:00:00Z', 'absolute', now)

		expect(result.text).toBe('2026/01/14 10:00 UTC')
		// Absolute is already exact on screen — no redundant tooltip.
		expect(result.title).toBeUndefined()
	})

	it('renders relative text with the absolute value as the title in relative mode', () => {
		const now = new Date('2026-06-15T10:00:00Z')
		// 21 days earlier → "3 weeks ago".
		const result = formatTimestamp('2026-05-25T10:00:00Z', 'relative', now)

		expect(result.text).toBe('3 weeks ago')
		expect(result.title).toContain('2026/05/25')
	})
})
