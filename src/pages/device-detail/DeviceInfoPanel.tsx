import type { ReactNode } from 'react'
import type { DeviceDetail } from '../../api/devices'
import { StatusBadge } from '../../components/StatusBadge'
import { Timestamp } from '../../components/Timestamp'

// The device info as a grouped definition list (PAGES.md): Identity / Software /
// Lifecycle / User. Status is the authoritative badge (ADR-0001); the owning User is
// plain text (no Users page — CONTEXT.md).
export function DeviceInfoPanel({ device }: { device: DeviceDetail }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<InfoGroup title="Identity">
				<Field label="Vendor">{device.vendor}</Field>
				<Field label="Model">{device.model}</Field>
				<Field label="Short ID">{device.shortId}</Field>
				<Field label="Platform">{device.platform}</Field>
			</InfoGroup>
			<InfoGroup title="Software">
				<Field label="OS version">{device.osVersion}</Field>
				<Field label="App version">{device.appVersion}</Field>
				<Field label="Biometry">{device.biometryEnabled ? 'on' : 'off'}</Field>
			</InfoGroup>
			<InfoGroup title="Lifecycle">
				<Field label="Status">
					<StatusBadge status={device.status} />
				</Field>
				<Field label="Created">
					<Timestamp iso={device.createdAt} />
				</Field>
				<Field label="Last active">
					<Timestamp iso={device.lastActiveAt} />
				</Field>
			</InfoGroup>
			<InfoGroup title="User">
				<Field label="Name">{device.user.displayName}</Field>
			</InfoGroup>
		</div>
	)
}

function InfoGroup({
	title,
	children,
}: {
	title: string
	children: ReactNode
}) {
	return (
		<section className="rounded-sm border border-border p-4">
			<h2 className="mb-2 font-semibold text-text-muted text-xs uppercase tracking-wide">
				{title}
			</h2>
			<dl className="text-sm">{children}</dl>
		</section>
	)
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex justify-between gap-4 py-1">
			<dt className="text-text-muted">{label}</dt>
			<dd className="text-right text-text tabular-nums">{children}</dd>
		</div>
	)
}
