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

test('the browser chrome takes the colour of the chosen theme', async ({ page }) => {
	const themeColor = (scheme: 'light' | 'dark') =>
		page.locator(`meta[name="theme-color"][media*="${scheme}"]`);
	await page.goto('mehr/');
	await expect(themeColor('light')).toHaveAttribute('content', '#fcf3ee');

	await page.getByRole('radio', { name: /Himmel/ }).check();
	await expect(themeColor('light')).toHaveAttribute('content', '#eff3fa');
	await expect(themeColor('dark')).toHaveAttribute('content', '#131726');

	// Stays after moving on inside the app and after a full load.
	await page
		.getByRole('navigation', { name: 'Hauptnavigation' })
		.getByRole('link', { name: 'Kontakte' })
		.click();
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Kontakte');
	await expect(themeColor('light')).toHaveAttribute('content', '#eff3fa');
	await page.reload();
	await expect(themeColor('light')).toHaveAttribute('content', '#eff3fa');
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
