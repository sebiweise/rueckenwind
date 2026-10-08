import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the app works offline after the first visit', async ({ page, context }) => {
	await page.goto('app/');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	// Wait until the service worker controls the page and has precached everything.
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

	await context.setOffline(true);
	for (const [path, heading] of [
		['etappe/3/', 'Platzsuche'],
		['kontakte/', 'Kontakte'],
		['krise/', 'Hilfe in der Krise'],
		['./', 'Rückenwind'],
		['app/', 'Rückenwind']
	]) {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
	}

	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page.getByLabel('Was ist passiert? Eine Zeile reicht.').fill('Praxis Offline, Absage');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.locator('.progress')).toContainText('1 Nachweis gesammelt');

	await page.getByRole('link', { name: 'Nachweis-PDF erstellen' }).click();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'PDF erstellen' }).click();
	expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
	await context.setOffline(false);
});

test('the web app manifest is valid and installable', async ({ page, request }) => {
	await page.goto('./');
	const href = await page.locator('link[rel="manifest"]').getAttribute('href');
	expect(href).toBeTruthy();
	const manifest = await (await request.get(new URL(href!, page.url()).href)).json();
	expect(manifest).toMatchObject({ short_name: 'Rückenwind', display: 'standalone', lang: 'de' });
	// The installed app opens the app, not the start page.
	expect(new URL(manifest.start_url, page.url()).pathname).toMatch(/\/app\/$/);
	for (const icon of manifest.icons) {
		const response = await request.get(new URL(icon.src, page.url()).href);
		expect(response.ok()).toBe(true);
	}
});

test('inline scripts need a hash: the CSP has no unsafe-inline for scripts', async ({ page }) => {
	await page.goto('./');
	await page.waitForLoadState('networkidle');
	const policies = await page
		.locator('meta[http-equiv="Content-Security-Policy"]')
		.evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content')!));
	expect(policies).toHaveLength(1);
	const scriptSrc = policies[0].split(';').find((d) => d.trim().startsWith('script-src'))!;
	expect(scriptSrc).not.toContain("'unsafe-inline'");
	expect(scriptSrc).toContain("'sha256-");

	const blocked = await page.evaluate(
		() =>
			new Promise<string>((resolve) => {
				document.addEventListener('securitypolicyviolation', (event) =>
					resolve(event.effectiveDirective)
				);
				const script = document.createElement('script');
				script.textContent = 'window.injected = true';
				document.body.append(script);
			})
	);
	expect(blocked).toBe('script-src-elem');
	expect(
		await page.evaluate(() => (globalThis as { injected?: boolean }).injected)
	).toBeUndefined();
});

test('dark mode has no accessibility violations on every page', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
	for (const path of ['./', 'app/', 'kontakte/', 'daten/', 'etappe/5/', 'krise/', 'ueber/']) {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
	}
});
