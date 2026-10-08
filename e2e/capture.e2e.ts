import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function capture(page: Page, text: string) {
	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page.getByLabel('Was ist passiert? Eine Zeile reicht.').fill(text);
}

test('a contact attempt is saved with one tap after typing', async ({ page }) => {
	await page.goto('./');
	await capture(page, 'Praxis Weber, AB, Warteliste 8 Monate');

	const preview = page.locator('.preview');
	await expect(preview).toContainText('Praxis Weber');
	await expect(preview).toContainText('Warteliste');
	await expect(preview).toContainText('ca. 8 Monate');

	// Tap 1 after typing: save.
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('status')).toHaveText(
		'Warteliste notiert. Das zählt für deinen Nachweis.'
	);
	await expect(page.locator('.progress')).toContainText('1 Nachweis gesammelt');

	await page
		.getByRole('navigation', { name: 'Hauptnavigation' })
		.getByRole('link', { name: 'Kontakte' })
		.click();
	await expect(page.getByRole('heading', { name: 'Praxis Weber' })).toBeVisible();
	await expect(page.locator('.attempt')).toContainText('Warteliste');
});

test('chips can be corrected with a tap', async ({ page }) => {
	await page.goto('./');
	await capture(page, 'Dr. Koch blabla');
	const resultChip = page.locator('.chip', { hasText: 'Ergebnis' });
	await expect(resultChip).toContainText('Sonstiges');
	await expect(resultChip).toContainText('unsicher');

	// Tap 1: open the result, tap 2: pick "Absage", tap 3: save.
	await resultChip.click();
	await page.getByRole('radio', { name: 'Absage' }).click();
	await expect(resultChip).toContainText('Absage');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('status')).toHaveText(
		'Absage notiert. Das zählt für deinen Nachweis.'
	);
});

test('quick buttons work without typing', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	const save = page.getByRole('button', { name: 'Speichern' });
	await expect(save).toBeDisabled();
	await page.getByRole('button', { name: 'Nicht erreicht', exact: true }).click();
	await expect(page.locator('.preview')).toContainText('Praxis ohne Namen');
	await save.click();
	await expect(page.locator('.progress')).toContainText('1 Nachweis gesammelt');
});

test('three rejections on one day bring a gentle pause hint', async ({ page }) => {
	await page.goto('./');
	for (const name of ['Praxis A', 'Praxis B', 'Praxis C']) {
		await capture(page, `${name}, Absage`);
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByRole('dialog')).toBeHidden();
	}
	const hint = page.locator('[data-hint="pause"]');
	await expect(hint).toBeVisible();
	await hint.getByRole('button', { name: 'Ausblenden' }).click();
	await expect(hint).toBeHidden();
	await expect(page.locator('.progress')).toContainText('3 Nachweise gesammelt');
});

test('the next task can be marked as done', async ({ page }) => {
	await page.goto('./');
	const task = page.locator('.next-task');
	await expect(task).toContainText('Lies dir den Überblick in Ruhe durch.');
	await task.getByRole('button', { name: 'Erledigt' }).click();
	// Stage 1 is done, so stage 2 becomes the current one.
	await expect(page.locator('[aria-current="step"]')).toContainText('Sprechstunde');
	await expect(page.locator('.next-task')).toContainText('Vereinbare einen Termin');
});

test('stages can be chosen freely', async ({ page }) => {
	await page.goto('etappe/4/');
	await page.getByRole('button', { name: 'Hier stehe ich gerade' }).click();
	await expect(page.getByText('Hier stehst du gerade.')).toBeVisible();
	await page.goto('./');
	await expect(page.locator('[aria-current="step"]')).toContainText('Plan B');
});

test('practices can be added with phone hours, edited and deleted', async ({ page }) => {
	await page.goto('kontakte/');
	await page.getByText('Praxis anlegen').click();
	const form = page.locator('.add-practice');
	await form.getByLabel('Name').fill('Praxis Sonne');
	await form.getByLabel('Telefon', { exact: true }).fill('030 1234567');
	await form.getByLabel('Telefonzeiten').fill('Mo und Mi 8–9 Uhr');
	await form.getByRole('button', { name: 'Speichern' }).click();

	const card = page.locator('.practice', { hasText: 'Praxis Sonne' });
	await expect(card).toContainText('Mo und Mi 8–9 Uhr');
	await expect(card.getByRole('link', { name: '030 1234567' })).toHaveAttribute(
		'href',
		'tel:0301234567'
	);

	page.on('dialog', (dialog) => dialog.accept());
	await card.getByRole('button', { name: 'Löschen' }).click();
	await expect(card).toBeHidden();
});

test('a saved attempt can be edited later', async ({ page }) => {
	await page.goto('./');
	await capture(page, 'Praxis Mond nicht erreicht');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('status')).not.toBeEmpty();
	await page.goto('kontakte/');
	await page.getByRole('button', { name: /Kontaktversuch bearbeiten/ }).click();
	await page.getByLabel('Ergebnis').selectOption('rejected');
	await page.getByLabel('Datum').fill('2026-09-01T08:30');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.locator('.attempt')).toContainText('01.09.2026, 08:30');
	await expect(page.locator('.attempt')).toContainText('Absage');
});

for (const colorScheme of ['light', 'dark'] as const) {
	test(`core pages have no accessibility violations (${colorScheme})`, async ({ page }) => {
		await page.emulateMedia({ colorScheme });
		await page.goto('./');
		await capture(page, 'Praxis Weber, Absage');
		await expect(page.locator('.preview')).toBeVisible();
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByRole('status')).not.toBeEmpty();

		for (const path of ['./', 'kontakte/', 'daten/', 'etappe/3/']) {
			await page.goto(path);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await page.waitForLoadState('networkidle');
			expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
		}
	});
}
