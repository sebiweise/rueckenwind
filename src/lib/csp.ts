/**
 * Content-Security-Policy. Local-first: only the app's own origin is allowed.
 *
 * - Standalone server: sent as HTTP header (next.config.ts). Next.js' inline
 *   hydration scripts need 'unsafe-inline' there, because one header serves all pages.
 * - Every prerendered page: scripts/postbuild.mjs adds a <meta> tag with the
 *   hashes of that page's inline scripts instead of 'unsafe-inline'. With both,
 *   the browser enforces the stricter one. Static hosts only get the <meta> tag.
 * - Development: the layout renders the tag itself (no postbuild step there).
 */
export function contentSecurityPolicy(isDev: boolean, scriptHashes?: string[]): string {
	const inlineScripts = scriptHashes
		? scriptHashes.map((hash) => `'sha256-${hash}'`)
		: ["'unsafe-inline'"];
	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],
		'script-src': ["'self'", ...inlineScripts, ...(isDev ? ["'unsafe-eval'"] : [])],
		'style-src': ["'self'", "'unsafe-inline'"],
		'img-src': ["'self'", 'data:', 'blob:'],
		'font-src': ["'self'"],
		'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
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
