import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a chosen colour theme stays after reload, without errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	page.on('pageerror', (error) => errors.push(error.message));

	await page.goto('mehr/');
	const root = page.locator('html');
	await expect(page.getByRole('radio', { name: /Salbei/ })).toBeChecked();
	await expect(root).not.toHaveAttribute('data-palette');

	await page.getByRole('radio', { name: /Himmel/ }).check();
	await expect(root).toHaveAttribute('data-palette', 'himmel');

	await page.goto('app/');
	await expect(root).toHaveAttribute('data-palette', 'himmel');
	await page.goto('mehr/');
	await expect(page.getByRole('radio', { name: /Himmel/ })).toBeChecked();

	await page.getByRole('radio', { name: /Salbei/ }).check();
	await expect(root).not.toHaveAttribute('data-palette');
	expect(errors).toEqual([]);
});

for (const palette of ['pfirsich', 'himmel'] as const) {
	for (const colorScheme of ['light', 'dark'] as const) {
		test(`theme ${palette} has no accessibility violations (${colorScheme})`, async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.addInitScript((value) => {
				localStorage.setItem('rueckenwind.palette', value);
			}, palette);
			for (const path of ['./', 'app/', 'mehr/', 'daten/']) {
				await page.goto(path);
				await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
				const results = await new AxeBuilder({ page }).analyze();
				expect(results.violations).toEqual([]);
			}
		});
	}
}
