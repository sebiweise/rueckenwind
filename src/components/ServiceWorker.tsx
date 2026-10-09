'use client';

import { useEffect } from 'react';
// Starts listening for the browser's install dialog on every page, see InstallBanner.
import '@/lib/install/prompt';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Registers the service worker that makes the app work offline (production builds only). */
export function ServiceWorker() {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker
			.register(`${basePath}/sw.js`, { scope: `${basePath}/` })
			.catch(() => undefined);
	}, []);
	return null;
}
