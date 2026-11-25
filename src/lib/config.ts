/**
 * Central place for the app's name. The name is provisional until the
 * trademark search (DPMA/EUIPO, classes 9 and 44) is done, so never
 * hard-code it anywhere else.
 */
export const APP_NAME = 'Rückenwind';
export const APP_SUBTITLE = 'Therapieplatz finden';
export const APP_TITLE = `${APP_NAME} – ${APP_SUBTITLE}`;

/**
 * Sub-path the app is served from (`/rueckenwind` on GitHub Pages), empty at the root of a
 * domain. Inlined at build time from BASE_PATH, see next.config.ts.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Puts BASE_PATH in front of a root-relative URL ("/icons/icon.svg"). next/link does this by
 * itself; everything else (manifest, icons, service worker, Markdown links) needs it.
 */
export function withBasePath(url: string): string {
	return url.startsWith('/') && !url.startsWith('//') ? `${BASE_PATH}${url}` : url;
}
