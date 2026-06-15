import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Browser-side MSW for the dev server. Started from main.tsx in dev only.
export const worker = setupWorker(...handlers)
