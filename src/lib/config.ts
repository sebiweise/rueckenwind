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

/** Default of NEXT_PUBLIC_FEEDBACK_URL: the central feedback service (a Cloudflare Worker). */
export const DEFAULT_FEEDBACK_URL = 'https://feedback.goscinski.dev';

/** Project ID at the feedback service; it files the text as an issue in a private repository. */
export const FEEDBACK_PROJECT = 'rueckenwind';

/**
 * Endpoint of the opt-in feedback form, or null if it is switched off. Read from
 * NEXT_PUBLIC_FEEDBACK_URL at build time; an empty value switches the form off (e.g. for an
 * instance hosted by someone else). Plain http is only taken for a local test server.
 */
export function feedbackEndpoint(baseUrl: string | undefined): URL | null {
	if (baseUrl === '') return null;
	const url = new URL(baseUrl ?? DEFAULT_FEEDBACK_URL);
	const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
	if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
		throw new Error(`NEXT_PUBLIC_FEEDBACK_URL must use https: ${url.origin}`);
	}
	// Strip trailing slashes without a regex (avoids backtracking on long inputs).
	let end = url.pathname.length;
	while (end > 0 && url.pathname[end - 1] === '/') end--;
	return new URL(`${url.pathname.slice(0, end)}/v1/feedback/${FEEDBACK_PROJECT}`, url.origin);
}

export const FEEDBACK_ENDPOINT = feedbackEndpoint(process.env.NEXT_PUBLIC_FEEDBACK_URL);
