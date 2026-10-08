/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

/*
 * Service worker: precaches every page and asset at install, so the app works
 * offline after the first visit. It only ever talks to the app's own origin.
 * Built by scripts/postbuild.mjs into sw.js.
 */

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	precacheOptions: { cleanupOutdatedCaches: true, ignoreURLParametersMatching: [/.*/] },
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: false,
	runtimeCaching: defaultCache
});

serwist.addEventListeners();
