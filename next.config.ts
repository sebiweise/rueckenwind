import type { NextConfig } from 'next';

// GitHub Pages serves the app from /<repo>; the deploy workflow sets BASE_PATH.
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
	// Fully static app: `next build` writes plain HTML/CSS/JS to out/, no server.
	output: 'export',
	basePath,
	trailingSlash: true,
	images: { unoptimized: true },
	poweredByHeader: false
};

export default nextConfig;
