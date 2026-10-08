import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('the proof PDF is created in the browser, without requests to other origins', async ({
	page,
	baseURL
}) => {
	const origin = new URL(baseURL!).origin;
	const foreign: string[] = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(request.url());
	});

	await page.goto('app/');
	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page.getByLabel('Was ist passiert? Eine Zeile reicht.').fill('Praxis Müller, Absage');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('status').first()).not.toBeEmpty();

	await page.getByRole('link', { name: 'Nachweis-PDF erstellen' }).click();
	await page.getByLabel('Dein Name für das PDF (freiwillig)').fill('Jürgen Weiß');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'PDF erstellen' }).click();
	const download = await downloadPromise;

	expect(download.suggestedFilename()).toMatch(/^nachweis-psychotherapie-\d{4}-\d{2}-\d{2}\.pdf$/);
	const pdf = await readFile(await download.path());
	expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
	expect(pdf.length).toBeGreaterThan(10_000);
	await expect(page.getByText('Dein Nachweis-PDF ist fertig.')).toBeVisible();
	expect(foreign).toEqual([]);

	// The name is remembered for the next PDF, and only there.
	await page.reload();
	await expect(page.getByLabel('Dein Name für das PDF (freiwillig)')).toHaveValue('Jürgen Weiß');
});
