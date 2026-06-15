import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type AsyncStateProps<T> = {
	query: UseQueryResult<T>
	skeleton?: ReactNode
	children: (data: T) => ReactNode
}

function DefaultSkeleton() {
	return (
		<div
			role="status"
			aria-busy="true"
			aria-label="Loading"
			className="h-24 animate-pulse rounded-md bg-surface-2"
		/>
	)
}

// Reusable per-page wrapper: skeleton while loading, a clear error + manual Retry
// after Query's retries are exhausted, otherwise the resolved content. Offline is a
// separate path (the global snackbar) — cached data keeps rendering here.
export function AsyncState<T>({
	query,
	skeleton,
	children,
}: AsyncStateProps<T>) {
	if (query.isError) {
		return (
			<div role="alert" className="rounded-md border border-border p-4">
				<p className="text-text">
					Something went wrong while loading this data.
				</p>
				<button
					type="button"
					onClick={() => query.refetch()}
					className="mt-2 rounded-md bg-accent px-3 py-1 font-medium text-white"
				>
					Retry
				</button>
			</div>
		)
	}

	// Loading is driven by Query's status, not `data` presence: a query that resolves
	// to `undefined`, or one paused offline with no cache yet, stays non-success and
	// keeps the skeleton instead of being mistaken for content.
	if (!query.isSuccess) {
		return <>{skeleton ?? <DefaultSkeleton />}</>
	}

	return <>{children(query.data)}</>
}
