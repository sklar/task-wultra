import { queryOptions } from '@tanstack/react-query'
import { fetchJson } from './client'

// Minimal slice of statistics.json used only to prove the data layer end-to-end in
// the walking skeleton. The real Dashboard query lands in a later slice.
type SampleStatistics = {
	totals: { devices: number }
}

export const sampleQueryOptions = queryOptions({
	queryKey: ['sample', 'statistics'],
	queryFn: () => fetchJson<SampleStatistics>('statistics.json'),
})
