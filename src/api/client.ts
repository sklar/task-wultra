// The Wultra mock API — static JSON on GitHub Pages. MSW intercepts these URLs
// in dev (to demo loading/error/offline) and in tests (as the network mock).
export const API_BASE = 'https://wultra.github.io/mtoken-tools/react-demo-api'

// A failed HTTP response, carrying the status so callers can distinguish cases — e.g.
// the device-detail page treats 404 as a "not found" state rather than a generic error.
export class HttpError extends Error {
	readonly status: number

	constructor(status: number, path: string) {
		super(`Request to ${path} failed with ${status}`)
		this.name = 'HttpError'
		this.status = status
	}
}

export async function fetchJson<T>(path: string): Promise<T> {
	const response = await fetch(`${API_BASE}/${path}`)
	if (!response.ok) {
		throw new HttpError(response.status, path)
	}
	return response.json() as Promise<T>
}

// True for a 404 — an unknown resource (e.g. a bad device id), distinct from a
// transport/server failure which gets the generic error + Retry path.
export function isNotFoundError(error: unknown): boolean {
	return error instanceof HttpError && error.status === 404
}
