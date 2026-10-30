'use client';

import { useEffect, useRef, useState } from 'react';
// Starts listening for the browser's install dialog on every page, see InstallBanner.
import '@/lib/install/prompt';
import { t } from '@/lib/i18n';

/** Message that tells a waiting service worker to take over (handled by Serwist in src/sw.ts). */
export const SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' } as const;

/** A new version is waiting (`worker`), or another tab already switched to it (`null`). */
type Update = { worker: globalThis.ServiceWorker | null };

/**
 * Registers the service worker that makes the app work offline (production builds only).
 * A new version waits until all tabs are closed, so open tabs keep loading their own
 * files. Until then a quiet notice offers to switch now.
 */
export function ServiceWorker() {
	const [update, setUpdate] = useState<Update | null>(null);
	const switching = useRef(false);

	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
		const container = navigator.serviceWorker;
		// On the first visit there is no controller yet: nothing to update then.
		let hadController = !!container.controller;
		let registration: ServiceWorkerRegistration | undefined;

		function offer(worker: globalThis.ServiceWorker | null) {
			if (worker && container.controller) setUpdate({ worker });
		}

		function track(found: ServiceWorkerRegistration) {
			registration = found;
			offer(found.waiting);
			found.addEventListener('updatefound', () => {
				const installing = found.installing;
				installing?.addEventListener('statechange', () => {
					if (installing.state === 'installed') offer(installing);
				});
			});
		}

		function onControllerChange() {
			// This tab asked for the new version: load the page with it.
			if (switching.current) {
				globalThis.location.reload();
				return;
			}
			// Another tab switched. Do not reload unasked, unsaved input could get lost.
			if (hadController) setUpdate({ worker: null });
			hadController = true;
		}

		// An app that stays open for days still learns about new versions.
		function checkForUpdate() {
			if (document.visibilityState === 'visible') registration?.update().catch(() => undefined);
		}

		container.register('/sw.js', { scope: '/' }).then(track, () => undefined);
		container.addEventListener('controllerchange', onControllerChange);
		document.addEventListener('visibilitychange', checkForUpdate);
		return () => {
			container.removeEventListener('controllerchange', onControllerChange);
			document.removeEventListener('visibilitychange', checkForUpdate);
		};
	}, []);

	if (!update) return null;

	function reload() {
		if (!update?.worker) {
			globalThis.location.reload();
			return;
		}
		switching.current = true;
		update.worker.postMessage(SKIP_WAITING_MESSAGE);
	}

	return (
		<aside className="notice update-notice" aria-labelledby="update-notice-text">
			<p id="update-notice-text">{t('update.text')}</p>
			<p className="hint-actions">
				<button type="button" className="button button-primary" onClick={reload}>
					{t('update.reload')}
				</button>
				<button type="button" className="button button-quiet" onClick={() => setUpdate(null)}>
					{t('update.later')}
				</button>
			</p>
		</aside>
	);
}
