import type { NextConfig } from 'next';
import { contentSecurityPolicy } from './src/lib/csp';

/**
 * Two build targets from one codebase:
 * - `standalone` (default): a minimal Node server in .next/standalone, used by the Dockerfile
 *   and any Node host.
 * - `export` (NEXT_OUTPUT=export): plain HTML/CSS/JS in out/, for GitHub Pages or any static host.
 * Either way the server only delivers the app; user data never leaves the browser.
 */
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

// GitHub Pages serves the app from /<repo>; the Pages workflow sets BASE_PATH.
const basePath = process.env.BASE_PATH ?? '';

const securityHeaders = [
	{
		key: 'Content-Security-Policy',
		value: contentSecurityPolicy(process.env.NODE_ENV === 'development')
	},
	{ key: 'Referrer-Policy', value: 'no-referrer' },
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'DENY' },
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	}
];

const nextConfig: NextConfig = {
	output: isStaticExport ? 'export' : 'standalone',
	basePath,
	trailingSlash: true,
	images: { unoptimized: true },
	poweredByHeader: false,
	env: { NEXT_PUBLIC_BASE_PATH: basePath },
	// Static hosts cannot send headers; there the CSP comes from the <meta> tag in the layout.
	...(isStaticExport
		? {}
		: {
				async headers() {
					return [{ source: '/:path*', headers: securityHeaders }];
				}
			})
};

export default nextConfig;
