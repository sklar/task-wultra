const formatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'long',
	timeStyle: 'short',
	timeZone: 'UTC',
})

// "Statistics as of {generatedAt}" — stats-specific freshness shown near the charts,
// not in the global footer. The machine-readable ISO lives on the <time> element.
export function Freshness({ generatedAt }: { generatedAt: string }) {
	return (
		<p className="text-xs text-text-muted text-center opacity-30">
			Statistics as of{' '}
			<time dateTime={generatedAt}>
				{formatter.format(new Date(generatedAt))} UTC
			</time>
		</p>
	)
}
