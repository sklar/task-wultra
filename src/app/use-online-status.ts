import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

// Subscribe to Query's onlineManager — the single source of online/offline truth,
// which tests drive with `onlineManager.setOnline(false)`.
export function useOnlineStatus(): boolean {
	return useSyncExternalStore(
		(onChange) => onlineManager.subscribe(onChange),
		() => onlineManager.isOnline(),
		() => true,
	)
}
