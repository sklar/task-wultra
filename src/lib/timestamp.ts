// Timestamp format preference (ADR-0003): `absolute` shows the exact date, `relative`
// shows "3 weeks ago". Default is `absolute` (see PAGES.md / Settings).
export type TimestampFormat = 'absolute' | 'relative'

// A rendered timestamp: `text` is the visible label; `title` carries the absolute
// value as a native tooltip in relative mode (undefined in absolute mode, where the
// visible text is already exact). The ISO always rides on the <time dateTime> element.
export type RenderedTimestamp = { text: string; title?: string }

const absoluteFormatter = new Intl.DateTimeFormat('en-GB', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
	timeZone: 'UTC',
})

// e.g. "2026/01/14 10:00 UTC" — UTC-pinned so the audit data reads the same everywhere.
// Assembled from parts because no en-locale date-style preset yields slash-separated
// YYYY/MM/DD.
export function formatAbsolute(iso: string): string {
	const parts = Object.fromEntries(
		absoluteFormatter
			.formatToParts(new Date(iso))
			.map((part) => [part.type, part.value]),
	)
	return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute} UTC`
}

export function formatTimestamp(
	iso: string,
	format: TimestampFormat,
	now: Date,
): RenderedTimestamp {
	const absolute = formatAbsolute(iso)
	if (format === 'relative') {
		return { text: formatRelative(iso, now), title: absolute }
	}
	return { text: absolute }
}

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

// Ordered units with how many of each make the next; the last is the catch-all.
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
	{ amount: 60, unit: 'second' },
	{ amount: 60, unit: 'minute' },
	{ amount: 24, unit: 'hour' },
	{ amount: 7, unit: 'day' },
	{ amount: 4.34524, unit: 'week' },
	{ amount: 12, unit: 'month' },
	{ amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

// "3 weeks ago" / "in 2 days" — picks the largest unit the gap fits into.
export function formatRelative(iso: string, now: Date): string {
	let duration = (new Date(iso).getTime() - now.getTime()) / 1000
	for (const division of DIVISIONS) {
		if (Math.abs(duration) < division.amount) {
			return relativeFormatter.format(Math.round(duration), division.unit)
		}
		duration /= division.amount
	}
	return relativeFormatter.format(Math.round(duration), 'year')
}
