// Runs after `next build` (static export to out/):
// 1. adds a CSP <meta> to every prerendered page that allows only that page's inline scripts (by hash),
// 2. builds the service worker (sw.js) with a precache list of all pages and assets,
// 3. copies sw.js to out/.
// With BASE_PATH (GitHub Pages: /rueckenwind) every precached URL starts with it.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { runBuildCommand } from '@serwist/cli';
import { serwist } from '@serwist/next/config';
import { contentSecurityPolicy } from '../src/lib/csp.ts';

function htmlFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir).flatMap((name) => {
		const file = path.join(dir, name);
		if (statSync(file).isDirectory()) return htmlFiles(file);
		return name.endsWith('.html') ? [file] : [];
	});
}

/** Adds the CSP <meta> tag with the hashes of this page's inline scripts at the top of <head>. */
function addCsp(file) {
	const html = readFileSync(file, 'utf8');
	if (html.includes('http-equiv="Content-Security-Policy"')) {
		throw new Error(`${file}: already has a CSP meta tag`);
	}
	const hashes = new Set();
	for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
		if (/\bsrc=/.test(attributes) || body === '') continue;
		hashes.add(createHash('sha256').update(body, 'utf8').digest('base64'));
	}
	const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(false, [...hashes])}"/>`;
	let added = false;
	const next = html.replace(/<head>(<meta charSet="utf-8"\/>)?/, (head) => {
		added = true;
		return head + meta;
	});
	// Static hosts send no CSP header, so a page without the meta tag would ship without any CSP.
	if (!added) throw new Error(`${file}: no <head> found to insert the CSP meta tag`);
	writeFileSync(file, next);
}

const pages = htmlFiles('out');
pages.forEach(addCsp);
const hardened = pages.length;
if (hardened === 0) throw new Error('CSP: no prerendered page with a CSP meta tag found');
console.log(`CSP: inline scripts hashed in ${hardened} pages`);

// Same value as basePath in next.config.ts, which Serwist reads as well.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const config = await serwist({ swSrc: 'src/sw.ts', swDest: 'public/sw.js' });
// Runs after Serwist's own transform, which turns "etappe/1.html" into "<basePath>/etappe/1"
// and ".next/static/…" into "/_next/static/…".
config.manifestTransforms.push((entries) => ({
	manifest: entries.map((entry) => {
		let { url } = entry;
		// Serwist puts only assetPrefix in front of /_next/, not basePath.
		if (url.startsWith('/_next/')) url = `${basePath}${url}`;
		// Pages are served with a trailing slash (next.config.ts), so precache them that way.
		if (!/\.[a-z0-9]+$/i.test(url) && !url.endsWith('/')) url = `${url}/`;
		return { ...entry, url };
	}),
	warnings: []
}));
await runBuildCommand({ config, watch: false });

cpSync('public/sw.js', 'out/sw.js');
