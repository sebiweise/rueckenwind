import type { InstallPromptEvent } from '.';

/**
 * Keeps the browser's install dialog for later. Chromium fires `beforeinstallprompt` once,
 * often right after loading, so the listener starts as soon as this module loads (it is
 * imported by a component in the root layout) and the event survives page changes.
 */
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) listener();
}

if (typeof document !== 'undefined') {
	globalThis.addEventListener('beforeinstallprompt', (event) => {
		event.preventDefault();
		deferred = event as InstallPromptEvent;
		notify();
	});
	globalThis.addEventListener('appinstalled', () => {
		deferred = null;
		notify();
	});
}

export function subscribeInstallPrompt(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function installPrompt(): InstallPromptEvent | null {
	return deferred;
}

/** Opens the browser's install dialog. The event can only be used once. */
export async function showInstallPrompt(): Promise<boolean> {
	const event = deferred;
	if (!event) return false;
	deferred = null;
	notify();
	await event.prompt();
	const { outcome } = await event.userChoice;
	return outcome === 'accepted';
}

/** For click handlers: opens the dialog; a refused or failed dialog changes nothing. */
export function installNow(): void {
	showInstallPrompt().catch(() => undefined);
}

/** Lets the hooks re-read local state (for example after "Nicht jetzt"). */
export function refreshInstallState(): void {
	notify();
}
