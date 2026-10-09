import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
	'etappe/1/',
	'etappe/2/',
	'etappe/3/',
	'etappe/4/',
	'etappe/5/',
	'krise/',
	'hinweis/',
	'ueber/',
	'hilfen/'
];

for (const path of PAGES) {
	test(`${path} shows review date, sources and the crisis button`, async ({ page }) => {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByText(/Zuletzt geprüft am \d+\. \w+ \d{4}/)).toBeVisible();
		await page.getByText('Quellen', { exact: true }).click();
		await expect(page.locator('.content-meta li a').first()).toBeVisible();
		await expect(page.getByRole('link', { name: 'Krise? Hilfe' })).toBeVisible();
		const results = await new AxeBuilder({ page }).analyze();
		expect(results.violations).toEqual([]);
	});
}

test('stage details open on demand and stages link to each other', async ({ page }) => {
	await page.goto('app/');
	await page.getByRole('link', { name: 'Sprechstunde' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sprechstunde');
	const details = page.locator('details').first();
	await expect(details).not.toHaveAttribute('open');
	await details.locator('summary').click();
	await expect(details).toHaveAttribute('open');
	await page.getByRole('link', { name: /^Weiter\W+Platzsuche$/ }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Platzsuche');
});

test('crisis page lists the emergency numbers', async ({ page }) => {
	await page.goto('./');
	await page.getByRole('link', { name: 'Krise? Hilfe' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hilfe in der Krise');
	for (const number of ['112', '0800 111 0 111', '0800 111 0 222']) {
		await expect(page.getByRole('link', { name: number, exact: true })).toBeVisible();
	}
});
