import { QueryClient } from '@tanstack/react-query'

// A fresh client per test with retries off — default retries make error tests
// hang and flake (see the PRD's Testing Decisions).
export function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	})
}
