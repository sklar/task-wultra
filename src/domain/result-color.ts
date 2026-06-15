import type { EventResult } from '../api/devices'

// One source of truth for Event `result` colours, mirroring STATUS_COLOR. Green reads
// as a good outcome; rose matches the `removed` status hue (Tailwind rose-500). Used to
// colour-code the result column in the device-detail Event history (PAGES.md).
export const RESULT_COLOR: Record<EventResult, string> = {
	success: '#22c55e',
	rejected: '#f43f5e',
}
