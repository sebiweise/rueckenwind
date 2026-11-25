import type { NextConfig } from 'next';

/**
 * Static export: plain HTML/CSS/JS in out/, served by GitHub Pages (.github/workflows/pages.yml)
 * or any static host. There is no server logic; user data never leaves the browser.
 * Static hosts cannot send headers: the CSP comes from the <meta> tag that
 * scripts/postbuild.mjs adds to every page, the referrer policy from a <meta> tag in the layout.
 */

// GitHub Pages serves the app from /<repo>; the Pages workflow sets BASE_PATH=/rueckenwind.
// Empty (the default) puts the app at the root of the domain.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

const nextConfig: NextConfig = {
	output: 'export',
	basePath,
	trailingSlash: true,
	images: { unoptimized: true },
	poweredByHeader: false,
	// next/link adds basePath by itself; every other root-relative URL uses withBasePath().
	env: { NEXT_PUBLIC_BASE_PATH: basePath }
};

export default nextConfig;
