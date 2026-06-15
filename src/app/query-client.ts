import { QueryClient } from '@tanstack/react-query'

// App-wide client. Default `networkMode: 'online'` means offline pauses queries
// (a separate path from errors) and auto-resumes on reconnect — see JUSTIFICATION.
export const queryClient = new QueryClient()
