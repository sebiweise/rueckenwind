import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('export, delete all and import restore the same data', async ({ page }) => {
	await page.goto('app/');
	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page
		.getByLabel('Was ist passiert? Eine Zeile reicht.')
		.fill('Praxis Weber, Warteliste 1 Jahr');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('status')).not.toBeEmpty();

	await page.goto('daten/');
	const status = page.locator('.toast-inline');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Sicherung herunterladen' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toMatch(/^rueckenwind-\d{4}-\d{2}-\d{2}\.json$/);
	const file = await download.path();
	const backup = JSON.parse(await readFile(file, 'utf8'));
	expect(backup.practices[0].name).toBe('Praxis Weber');

	page.on('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Alle Daten löschen' }).click();
	await expect(status).toHaveText('Alle Daten wurden gelöscht.');
	await page.goto('kontakte/');
	await expect(page.getByText('Noch keine Kontakte.')).toBeVisible();

	await page.goto('daten/');
	await page.getByLabel('Sicherung einspielen').setInputFiles(file);
	await expect(status).toHaveText('Sicherung eingespielt.');
	await page.goto('kontakte/');
	await expect(page.getByRole('heading', { name: 'Praxis Weber' })).toBeVisible();
	await expect(page.locator('.attempt')).toContainText('ca. 12 Monate');
});

test('a foreign file is rejected without changes', async ({ page }) => {
	await page.goto('daten/');
	await page.getByLabel('Sicherung einspielen').setInputFiles({
		name: 'fremd.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{"app":"andere"}')
	});
	await expect(page.locator('.toast-inline')).toHaveText(
		'Diese Datei ist keine Sicherung aus dieser App.'
	);
});
