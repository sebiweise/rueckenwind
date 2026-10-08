// Takes the README screenshots from a running server (default http://localhost:4173/)
// with made-up example data. Usage: node scripts/screenshots.mjs [baseUrl]
import { chromium, devices } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4173/';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });

for (const colorScheme of ['light', 'dark']) {
	const context = await browser.newContext({ ...devices['Pixel 7'], colorScheme });
	const page = await context.newPage();
	const shot = (name) => page.screenshot({ path: `docs/screenshots/${name}-${colorScheme}.png` });

	await page.goto(base, { waitUntil: 'networkidle' });
	await shot('einfuehrung');

	await page.goto(new URL('app/', base).href, { waitUntil: 'networkidle' });
	for (const line of [
		'Praxis Weber, AB, Warteliste 8 Monate',
		'Dr. Müller, keine Kapazitäten',
		'Praxis Sonnenschein nicht erreicht',
		'TSS angerufen, Termin am 3.11.'
	]) {
		await page.getByRole('button', { name: 'Kontakt notieren' }).click();
		await page.getByLabel('Was ist passiert? Eine Zeile reicht.').fill(line);
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.getByRole('dialog').waitFor({ state: 'hidden' });
	}
	await page.locator('.next-task button').click();
	await page.reload();
	await page.waitForSelector('.progress');
	await shot('start');

	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page
		.getByLabel('Was ist passiert? Eine Zeile reicht.')
		.fill('Praxis Lindner, Warteliste ca. 1 Jahr');
	await page.waitForTimeout(200);
	await shot('erfassen');
	await page.keyboard.press('Escape');

	await page.goto(new URL('kontakte/', base).href);
	await page.waitForSelector('.practice');
	await shot('kontakte');

	await page.goto(new URL('etappe/2/', base).href);
	await page.locator('details').first().locator('summary').click();
	await shot('etappe');
	await context.close();
}
await browser.close();
