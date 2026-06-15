import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Node-side MSW for tests. Started/stopped in src/test/setup.ts.
export const server = setupServer(...handlers)
