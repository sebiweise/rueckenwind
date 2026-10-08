// Serves the static export in out/ for local previews and E2E tests.
// Deliberately tiny so the repo needs no extra server dependency.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('out');
const port = Number(process.env.PORT ?? 4173);
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

async function resolveFile(urlPath) {
	const path = join(root, normalize(decodeURIComponent(urlPath)));
	if (!path.startsWith(root)) return null;
	for (const candidate of [path, join(path, 'index.html'), `${path}.html`]) {
		const info = await stat(candidate).catch(() => null);
		if (info?.isFile()) return candidate;
	}
	return null;
}

createServer(async (request, response) => {
	const { pathname } = new URL(request.url ?? '/', 'http://localhost');
	const file = (await resolveFile(pathname)) ?? join(root, '404.html');
	response.writeHead(file.endsWith('404.html') && pathname !== '/404.html' ? 404 : 200, {
		'Content-Type': types[extname(file)] ?? 'application/octet-stream'
	});
	createReadStream(file).pipe(response);
}).listen(port, () => console.log(`Preview: http://localhost:${port}/`));
