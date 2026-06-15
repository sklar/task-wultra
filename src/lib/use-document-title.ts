import { useEffect } from 'react'

// Set the document title imperatively from a component. Used for the device-detail
// title (`{model} ({shortId}) · …`), whose data lives in the Query cache rather than a
// router loader, so it can't go through the router's static `head` API (PAGES.md).
export function useDocumentTitle(title: string | undefined) {
	useEffect(() => {
		if (title) {
			document.title = title
		}
	}, [title])
}
