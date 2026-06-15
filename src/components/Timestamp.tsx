import { formatTimestamp } from '../lib/timestamp'
import { usePreferences } from '../preferences/PreferencesProvider'

// One shared timestamp renderer for the whole app (list, detail, event rows). Always a
// semantic <time dateTime={iso}> so machines/AT get the exact value regardless of the
// chosen format; in relative mode the visible text is relative and `title` carries the
// absolute value (PAGES.md). Reads the live `timestampFormat` preference (ADR-0003).
export function Timestamp({ iso }: { iso: string }) {
	const { timestampFormat } = usePreferences()
	const { text, title } = formatTimestamp(iso, timestampFormat, new Date())
	return (
		<time dateTime={iso} title={title}>
			{text}
		</time>
	)
}
