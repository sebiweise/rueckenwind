import type { NextConfig } from 'next';
import { contentSecurityPolicy } from './src/lib/csp';

/**
 * Two build targets from one codebase:
 * - `standalone` (default): a minimal Node server in .next/standalone for any Node host.
 * - `export` (NEXT_OUTPUT=export): plain HTML/CSS/JS in out/, used by Vercel (vercel.json) or any static host.
 * Either way the server only delivers the app; user data never leaves the browser.
 */
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

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
	trailingSlash: true,
	images: { unoptimized: true },
	poweredByHeader: false,
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
