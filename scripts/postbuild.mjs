// Runs after `next build` for both targets:
// 1. adds a CSP <meta> to every prerendered page that allows only that page's inline scripts (by hash),
// 2. builds the service worker (sw.js) with a precache list of all pages and assets,
// 3. puts sw.js and public/ where each target serves them.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { runBuildCommand } from '@serwist/cli';
import { serwist } from '@serwist/next/config';
import { contentSecurityPolicy } from '../src/lib/csp.ts';

const isExport = process.env.NEXT_OUTPUT === 'export';

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
	if (!added) return false;
	writeFileSync(file, next);
	return true;
}

const pages = [
	...htmlFiles('.next/server/app'),
	...htmlFiles('.next/standalone/.next/server/app'),
	...(isExport ? htmlFiles('out') : [])
];
const hardened = pages.filter(addCsp).length;
if (hardened === 0) throw new Error('CSP: no prerendered page with a CSP meta tag found');
console.log(`CSP: inline scripts hashed in ${hardened} pages`);

const config = await serwist({ swSrc: 'src/sw.ts', swDest: 'public/sw.js' });
// Pages are served with a trailing slash (next.config.ts), so precache them that way.
// Runs after Serwist's own transform, which turns "etappe/1.html" into "/etappe/1".
config.manifestTransforms.push((entries) => ({
	manifest: entries.map((entry) =>
		/\.[a-z0-9]+$/i.test(entry.url) || entry.url.endsWith('/')
			? entry
			: { ...entry, url: `${entry.url}/` }
	),
	warnings: []
}));
await runBuildCommand({ config, watch: false });

if (isExport) {
	cpSync('public/sw.js', 'out/sw.js');
} else if (existsSync('.next/standalone')) {
	// The standalone server does not include public/ and .next/static by default.
	cpSync('public', '.next/standalone/public', { recursive: true });
	cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
}
