import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('start page shows the app name', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Rückenwind');
});

for (const colorScheme of ['light', 'dark'] as const) {
	test(`start page has no detectable accessibility violations (${colorScheme})`, async ({
		page
	}) => {
		await page.emulateMedia({ colorScheme });
		await page.goto('./');
		const results = await new AxeBuilder({ page }).analyze();
		expect(results.violations).toEqual([]);
	});
}

test('start page loads without errors or requests to other origins', async ({ page, baseURL }) => {
	const origin = new URL(baseURL!).origin;
	const foreign: string[] = [];
	const errors: string[] = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(request.url());
	});
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	page.on('pageerror', (error) => errors.push(error.message));

	await page.goto('./', { waitUntil: 'networkidle' });
	expect(foreign).toEqual([]);
	expect(errors).toEqual([]);
});

test('content security policy blocks requests to other origins', async ({ page }) => {
	await page.goto('./');
	const blocked = await page.evaluate(
		() =>
			new Promise<string>((resolve) => {
				document.addEventListener('securitypolicyviolation', (event) =>
					resolve(event.effectiveDirective)
				);
				fetch('https://example.org/').catch(() => undefined);
			})
	);
	expect(blocked).toBe('connect-src');
});

test('standalone server sends security headers', async ({ page }) => {
	// Static hosts like GitHub Pages cannot send HTTP headers, so only the server is checked.
	test.skip(process.env.E2E_TARGET === 'static', 'static hosts cannot send headers');
	const response = await page.goto('./');
	const headers = response!.headers();
	expect(headers['content-security-policy']).toContain("default-src 'self'");
	expect(headers['x-content-type-options']).toBe('nosniff');
	expect(headers['referrer-policy']).toBe('no-referrer');
});

test('the start page introduces the app and leads into it', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('heading', { name: 'So unterstützt dich Rückenwind' })).toBeVisible();
	// The start page is not part of the app: no navigation and no capture button.
	await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Kontakt notieren' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Krise? Hilfe' })).toBeVisible();

	await page.getByRole('link', { name: 'Los geht’s' }).first().click();
	await expect(page).toHaveURL(/\/app\/$/);
	await expect(page.getByRole('heading', { name: 'Dein Weg', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Kontakt notieren' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Rückenwind' })).toHaveAttribute('href', /\/app\/$/);
});

test('the installed app skips the start page', async ({ page }) => {
	await page.addInitScript(() => {
		const original = globalThis.matchMedia.bind(globalThis);
		globalThis.matchMedia = (query: string) =>
			query === '(display-mode: standalone)'
				? ({ ...original(query), matches: true } as MediaQueryList)
				: original(query);
	});
	await page.goto('./');
	await expect(page).toHaveURL(/\/app\/$/);
	await expect(page.getByRole('button', { name: 'Kontakt notieren' })).toBeVisible();
});
