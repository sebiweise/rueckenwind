/**
 * Content-Security-Policy for the static export, delivered as a <meta> tag
 * because GitHub Pages cannot set headers. Local-first: only the app's own
 * origin is allowed. Inline scripts are needed for Next.js' hydration data;
 * replacing 'unsafe-inline' with hashes is planned for phase 6.
 */
export function contentSecurityPolicy(isDev: boolean): string {
	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],
		'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
		'style-src': ["'self'", "'unsafe-inline'"],
		'img-src': ["'self'", 'data:', 'blob:'],
		'font-src': ["'self'"],
		'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
		'object-src': ["'none'"],
		'base-uri': ["'self'"],
		'form-action': ["'self'"]
	};
	return Object.entries(directives)
		.map(([name, values]) => `${name} ${values.join(' ')}`)
		.join('; ');
}
