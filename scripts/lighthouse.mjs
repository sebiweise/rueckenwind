// Checks Lighthouse scores (mobile) for the main pages against a running server.
// Usage: node scripts/lighthouse.mjs [baseUrl]; needs `lighthouse` (npx) and Chrome (CHROME_PATH).
// Each page runs several times and the median counts, because single runs on shared CI
// machines vary by more than ten performance points.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4173/';
const pages = ['', 'kontakte/', 'daten/', 'etappe/3/', 'krise/'];
const categories = ['performance', 'accessibility', 'best-practices'];
const minimum = 0.9;
const runs = 3;
const dir = mkdtempSync(path.join(tmpdir(), 'lighthouse-'));

let failed = false;
for (const page of pages) {
	const results = [];
	for (let run = 0; run < runs; run++) results.push(audit(new URL(page, base).href));
	const scores = categories.map((id) => [id, median(results.map((r) => r[id]))]);
	console.log(
		`/${page}`,
		scores.map(([id, score]) => `${id} ${Math.round(score * 100)}`).join(', ')
	);
	if (scores.some(([, score]) => score < minimum)) failed = true;
}
if (failed) {
	console.error(`At least one median score is below ${minimum * 100}.`);
	process.exit(1);
}

function audit(url) {
	const output = path.join(dir, 'report.json');
	execFileSync(
		'npx',
		[
			'--yes',
			'lighthouse@13.5.0',
			url,
			'--quiet',
			'--chrome-flags=--headless=new --no-sandbox',
			`--only-categories=${categories.join(',')}`,
			'--output=json',
			`--output-path=${output}`
		],
		{ stdio: 'inherit', env: { ...process.env, NO_UPDATE_NOTIFIER: '1' } }
	);
	const report = JSON.parse(readFileSync(output, 'utf8'));
	// One line per run, so a failing CI job shows which metric pulled the score down.
	const metrics = ['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'];
	console.log(
		`  ${url}`,
		`performance ${Math.round(report.categories.performance.score * 100)}`,
		metrics.map((id) => `${id} ${report.audits[id].displayValue}`).join(', ')
	);
	return Object.fromEntries(categories.map((id) => [id, report.categories[id].score]));
}

function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
}
