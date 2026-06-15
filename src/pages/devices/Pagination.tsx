// Client-side pagination controls (PAGES.md): first / prev / numbered / next / last with
// "page X of Y". Hidden when everything fits on a single page.
export function Pagination({
	page,
	totalPages,
	onGoTo,
}: {
	page: number
	totalPages: number
	onGoTo: (page: number) => void
}) {
	if (totalPages <= 1) {
		return null
	}
	const numbers = Array.from({ length: totalPages }, (_, i) => i + 1)
	const atFirst = page === 1
	const atLast = page === totalPages
	return (
		<nav
			aria-label="Pagination"
			className="flex flex-wrap items-center justify-center gap-2 text-sm"
		>
			<PageButton label="First" disabled={atFirst} onClick={() => onGoTo(1)} />
			<PageButton
				label="Prev"
				disabled={atFirst}
				onClick={() => onGoTo(page - 1)}
			/>
			{numbers.map((n) => (
				<PageButton
					key={n}
					label={String(n)}
					current={n === page}
					onClick={() => onGoTo(n)}
				/>
			))}
			<PageButton
				label="Next"
				disabled={atLast}
				onClick={() => onGoTo(page + 1)}
			/>
			<PageButton
				label="Last"
				disabled={atLast}
				onClick={() => onGoTo(totalPages)}
			/>
			<span className="ml-2 text-text-muted">
				Page {page} of {totalPages}
			</span>
		</nav>
	)
}

function PageButton({
	label,
	onClick,
	disabled = false,
	current = false,
}: {
	label: string
	onClick: () => void
	disabled?: boolean
	current?: boolean
}) {
	// The current page is highlighted with the accent fill; the others are quiet borders.
	const appearance = current
		? 'border-accent bg-accent text-white'
		: 'border-border text-text-muted hover:text-text'
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-current={current ? 'page' : undefined}
			className={`rounded-sm border px-2.5 py-1 disabled:opacity-40 ${appearance}`}
		>
			{label}
		</button>
	)
}
