import type { Status } from './status'

// One source of truth for Status colours so the badge and the dashboard donut always
// agree. Hexes are the Tailwind palette values used elsewhere: accent (#0099ff),
// amber-500, slate-400, rose-500.
export const STATUS_COLOR: Record<Status, string> = {
	active: '#0099ff',
	blocked: '#f59e0b',
	expired: '#94a3b8',
	removed: '#f43f5e',
}
