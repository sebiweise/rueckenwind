// Renders the PNG app icons from the SVGs in public/icons/ with Playwright's Chromium.
// Run after changing an icon: `node scripts/icons.mjs` (optionally with PLAYWRIGHT_CHROMIUM_PATH).
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const icons = [
	{ svg: 'icon.svg', png: 'icon-192.png', size: 192 },
	{ svg: 'icon.svg', png: 'icon-512.png', size: 512 },
	{ svg: 'maskable.svg', png: 'maskable-512.png', size: 512 },
	{ svg: 'maskable.svg', png: 'apple-touch-icon.png', size: 180 }
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
const page = await browser.newPage();
for (const { svg, png, size } of icons) {
	await page.setViewportSize({ width: size, height: size });
	const markup = readFileSync(`public/icons/${svg}`, 'utf8');
	await page.setContent(
		`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`
	);
	await page.screenshot({ path: `public/icons/${png}`, omitBackground: true });
}
await browser.close();
