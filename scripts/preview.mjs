// Serves the static export in out/ for local previews and E2E tests, the way GitHub Pages does:
// under BASE_PATH (e.g. /rueckenwind) if set, gzip, 404.html for unknown paths and no security
// headers (static hosts cannot send them; the CSP and referrer policy are <meta> tags).
// Deliberately tiny: no extra server dependency.
import { createReadStream, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { createGzip } from 'node:zlib';

const root = resolve('out');
const port = Number(process.env.PORT ?? 4173);
// Same value as basePath in next.config.ts: the build must have used the same BASE_PATH.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.webmanifest': 'application/manifest+json',
	'.woff2': 'font/woff2'
};

// Every file of the export, keyed by its URL path ("/etappe/1.html"). Requests are only looked up
// here, so no part of a URL ever becomes a file system path.
const files = new Map(
	readdirSync(root, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => {
			const file = join(entry.parentPath, entry.name);
			return [`/${relative(root, file).split(sep).join('/')}`, file];
		})
);

function resolveFile(urlPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(urlPath);
	} catch {
		// Malformed percent-encoding ("/%E0%A4%A"): answer 404 instead of crashing the server.
		return null;
	}
	const path = decoded.endsWith('/') ? decoded.slice(0, -1) : decoded;
	for (const candidate of [path, `${path}/index.html`, `${path}.html`]) {
		const file = files.get(candidate);
		if (file) return file;
	}
	return null;
}

/** True if Accept-Encoding allows gzip: an explicit gzip entry wins over *, q=0 forbids. */
function acceptsGzip(header = '') {
	const q = {};
	for (const part of header.split(',')) {
		const [name, ...params] = part.trim().toLowerCase().split(';');
		const value = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
		q[name] = value === undefined ? 1 : Number(value.slice(2));
	}
	return (q.gzip ?? q['*'] ?? 0) > 0;
}

createServer((request, response) => {
	const { pathname } = new URL(request.url ?? '/', 'http://localhost');
	// Like GitHub Pages: "/rueckenwind" redirects to "/rueckenwind/".
	if (basePath && pathname === basePath) {
		response.writeHead(301, { Location: `${basePath}/` }).end();
		return;
	}
	// Outside the base path GitHub Pages has nothing of this app either.
	const appPath = pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : null;
	const file = (appPath && resolveFile(appPath)) ?? join(root, '404.html');
	const type = types[extname(file)] ?? 'application/octet-stream';
	// Compress text like GitHub Pages does, so Lighthouse measures realistic transfer sizes.
	const gzip = !type.startsWith('image/png') && acceptsGzip(request.headers['accept-encoding']);
	response.writeHead(file.endsWith('404.html') && appPath !== '/404.html' ? 404 : 200, {
		'Content-Type': type,
		...(gzip && { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' })
	});
	// `file` is always an entry of `files` (built from out/ at startup) or 404.html, never a path from the request
	const stream = createReadStream(file); // NOSONAR
	(gzip ? stream.pipe(createGzip()) : stream).pipe(response);
}).listen(port, () => console.log(`Preview: http://localhost:${port}${basePath}/`));
