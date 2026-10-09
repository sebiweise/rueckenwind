import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Pretends the browser offers its install dialog, like Chrome does when the app is installable. */
async function offerInstall(page: import('@playwright/test').Page) {
	await page.evaluate(() => {
		const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
			prompt: () => Promise<void>;
			userChoice: Promise<{ outcome: string }>;
		};
		event.prompt = async () => {
			(globalThis as { prompted?: boolean }).prompted = true;
		};
		event.userChoice = Promise.resolve({ outcome: 'accepted' });
		globalThis.dispatchEvent(event);
	});
}

test('the install banner uses the browser’s dialog and stays away after “Nicht jetzt”', async ({
	page
}) => {
	await page.goto('app/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dein Weg');
	const banner = page.locator('.install-banner');
	await expect(banner).toHaveCount(0);

	await offerInstall(page);
	await expect(banner).toBeVisible();
	expect((await new AxeBuilder({ page }).include('.install-banner').analyze()).violations).toEqual(
		[]
	);
	await banner.getByRole('button', { name: 'Installieren' }).click();
	await expect
		.poll(() => page.evaluate(() => (globalThis as { prompted?: boolean }).prompted))
		.toBe(true);
	await expect(banner).toHaveCount(0);

	await page.reload();
	await offerInstall(page);
	await banner.getByRole('button', { name: 'Nicht jetzt' }).click();
	await expect(banner).toHaveCount(0);
	await page.reload();
	await offerInstall(page);
	await expect(page.locator('.today')).toBeVisible();
	await expect(banner).toHaveCount(0);
});

test('on iPhone the banner explains the share menu', async ({ browser, baseURL }) => {
	const context = await browser.newContext({ baseURL, userAgent: IPHONE });
	const page = await context.newPage();
	await page.goto('app/');
	const banner = page.locator('.install-banner');
	await expect(banner).toContainText('Zum Home-Bildschirm');
	await banner.getByRole('link', { name: 'So geht’s' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Als App installieren');
	await context.close();
});

test('the install guide is reachable from “Mehr” and accessible', async ({ page }) => {
	await page.goto('mehr/');
	await page.getByRole('link', { name: 'Als App installieren' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Als App installieren');
	await expect(page.getByRole('heading', { name: 'iPhone und iPad' })).toBeVisible();
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

	await offerInstall(page);
	await expect(
		page.locator('.install-status').getByRole('button', { name: 'Installieren' })
	).toBeVisible();
});
