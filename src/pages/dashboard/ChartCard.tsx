import type { ReactNode } from 'react'
import { useId } from 'react'

type ChartCardProps = {
	title: string
	className?: string
	children: ReactNode
}

// A labelled chart container: a <figure> named by its <figcaption> (so it's a
// reachable region with an accessible name) wrapping the UnoVis chart.
export function ChartCard({ title, className, children }: ChartCardProps) {
	const captionId = useId()
	return (
		<figure
			aria-labelledby={captionId}
			className={`flex flex-col justify-between gap-3 border border-border px-6 py-5 ${className ?? ''}`}
		>
			<figcaption
				id={captionId}
				className="text-sm font-medium text-text-muted"
			>
				{title}
			</figcaption>
			{/* No fixed height: each chart sizes its own container (the dense bars
			    need more room than the donut), so cards grow to fit their content. */}
			<div className="overflow-hidden">{children}</div>
		</figure>
	)
}
