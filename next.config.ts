import type { NextConfig } from 'next';

/**
 * Static export: plain HTML/CSS/JS in out/, served by Vercel (vercel.json) or any static host.
 * There is no server logic; user data never leaves the browser.
 * The CSP comes from the <meta> tag that scripts/postbuild.mjs adds to every page,
 * the other security headers from vercel.json.
 */
const nextConfig: NextConfig = {
	output: 'export',
	trailingSlash: true,
	images: { unoptimized: true },
	poweredByHeader: false
};

export default nextConfig;
