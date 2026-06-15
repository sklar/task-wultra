import type { Status } from '../domain/status'
import { STATUS_COLOR } from '../domain/status-color'

// The device's Status as an authoritative badge (ADR-0001). Coloured from the shared
// STATUS_COLOR map so it matches the donut; the `26` hex suffix is ~15% alpha for the
// translucent fill. Renders the status word verbatim so it's readable as plain text
// (assertable, screen-reader friendly).
export function StatusBadge({ status }: { status: Status }) {
	const color = STATUS_COLOR[status]
	return (
		<span
			className="inline-block rounded-full px-2 py-1 text-xs font-medium leading-none"
			style={{ color, backgroundColor: `${color}26` }}
		>
			{status}
		</span>
	)
}
