'use client';

import { useEffect } from 'react';
// Starts listening for the browser's install dialog on every page, see InstallBanner.
import '@/lib/install/prompt';

/** Registers the service worker that makes the app work offline (production builds only). */
export function ServiceWorker() {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
	}, []);
	return null;
}
