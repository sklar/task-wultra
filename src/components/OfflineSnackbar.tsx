import { useOnlineStatus } from '../app/use-online-status'

// Global, fixed-position notice shown whenever Query reports offline. `position:
// fixed` reserves no layout slot, so content never reflows when it toggles; cached
// page content stays visible beneath it. Clears itself on reconnect.
export function OfflineSnackbar() {
	const isOnline = useOnlineStatus()

	if (isOnline) {
		return null
	}
	return (
		<div
			role="status"
			className="fixed inset-x-0 bottom-0 z-50 bg-amber-500 px-4 py-3 text-center text-white shadow-lg"
		>
			🔌 You're offline — will refresh when reconnected
		</div>
	)
}
