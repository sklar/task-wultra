// The Wultra mock API — static JSON on GitHub Pages. MSW intercepts these URLs
// in dev (to demo loading/error/offline) and in tests (as the network mock).
export const API_BASE = 'https://wultra.github.io/mtoken-tools/react-demo-api'

export async function fetchJson<T>(path: string): Promise<T> {
	const response = await fetch(`${API_BASE}/${path}`)
	if (!response.ok) {
		throw new Error(`Request to ${path} failed with ${response.status}`)
	}
	return response.json() as Promise<T>
}
