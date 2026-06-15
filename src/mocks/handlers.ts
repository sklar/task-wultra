import { HttpResponse, http } from 'msw'
import { API_BASE } from '../api/client'
import { statisticsFixture } from './statistics.fixture'

// Default happy-path handlers. Tests override per-scenario with `server.use(...)`
// (latency, 500, transport failure, empty payloads); dev uses these as-is.
export const handlers = [
	http.get(`${API_BASE}/statistics.json`, () =>
		HttpResponse.json(statisticsFixture),
	),
]
