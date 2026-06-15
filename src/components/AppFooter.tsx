// Repository link is a placeholder until the real repo URL is supplied (like the
// logo asset); the mock API link is the live Wultra data source.
const REPOSITORY_URL = 'https://github.com/wultra/mtoken-tools'
const MOCK_API_URL = 'https://wultra.github.io/mtoken-tools/react-demo-api/'

export function AppFooter() {
	return (
		<footer className="flex flex-wrap items-center justify-center gap-2 px-4 py-4 text-center text-sm text-text-muted">
			<nav aria-label="Footer" className="flex gap-4">
				<a
					href={REPOSITORY_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-text-muted"
				>
					GitHub
				</a>
				<span className="text-border">/</span>
				<a
					href={MOCK_API_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-text-muted"
				>
					Mock API
				</a>
			</nav>
		</footer>
	)
}
