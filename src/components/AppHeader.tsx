import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
	{ to: '/', label: 'Dashboard', exact: true },
	{ to: '/devices', label: 'Devices', exact: false },
	{ to: '/settings', label: 'Settings', exact: false },
] as const

export function AppHeader() {
	return (
		<header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 bg-surface-2 px-4 py-4">
			<Link
				to="/"
				aria-label="Wultra Device Dashboard home"
				className="flex items-center text-text"
			>
				<Logo className="h-7 w-auto" />
			</Link>
			<nav className="flex gap-8">
				{NAV_LINKS.map((link) => (
					<Link
						key={link.to}
						to={link.to}
						activeOptions={{ exact: link.exact }}
						className="font-medium"
						activeProps={{
							'aria-current': 'page',
							className: 'text-accent',
						}}
					>
						{link.label}
					</Link>
				))}
			</nav>
			<ThemeToggle />
		</header>
	)
}
