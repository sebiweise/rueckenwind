/**
 * Content-Security-Policy. Local-first: only the app's own origin is allowed. The one exception
 * is the feedback service in connect-src: only the opt-in form at /feedback/ sends anything there.
 *
 * - Every exported page: scripts/postbuild.mjs adds a <meta> tag with the
 *   hashes of that page's inline scripts instead of 'unsafe-inline'.
 * - Development: the layout renders the tag itself (no postbuild step there),
 *   with 'unsafe-inline' for Next.js' inline scripts.
 */
export function contentSecurityPolicy(
	isDev: boolean,
	scriptHashes?: string[],
	feedbackOrigin?: string
): string {
	const inlineScripts = scriptHashes
		? scriptHashes.map((hash) => `'sha256-${hash}'`)
		: ["'unsafe-inline'"];
	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],
		'script-src': ["'self'", ...inlineScripts, ...(isDev ? ["'unsafe-eval'"] : [])],
		'style-src': ["'self'", "'unsafe-inline'"],
		'img-src': ["'self'", 'data:', 'blob:'],
		'font-src': ["'self'"],
		'connect-src': [
			"'self'",
			...(feedbackOrigin ? [feedbackOrigin] : []),
			...(isDev ? ['ws:'] : [])
		],
		'worker-src': ["'self'"],
		'manifest-src': ["'self'"],
		'object-src': ["'none'"],
		'base-uri': ["'self'"],
		'form-action': ["'self'"]
	};
	return Object.entries(directives)
		.map(([name, values]) => `${name} ${values.join(' ')}`)
		.join('; ');
}
