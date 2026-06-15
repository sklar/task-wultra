import { QueryClient } from '@tanstack/react-query'
import { isNotFoundError } from '../api/client'

// App-wide client. Default `networkMode: 'online'` means offline pauses queries
// (a separate path from errors) and auto-resumes on reconnect — see JUSTIFICATION.
// A 404 is a deterministic not-found, so skip the retries (which would otherwise stall
// a bad device link behind a few seconds of backoff before the not-found state shows);
// everything else keeps Query's default 3 attempts. Tests use their own client with
// `retry: false`, so this predicate is production-only.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) =>
				!isNotFoundError(error) && failureCount < 3,
		},
	},
})
