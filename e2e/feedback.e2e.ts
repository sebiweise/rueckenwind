import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The build uses the default of NEXT_PUBLIC_FEEDBACK_URL; requests to it never leave the test.
const SERVICE = 'https://feedback.goscinski.dev';
const ENDPOINT = `${SERVICE}/v1/feedback/rueckenwind`;

// Requests the service worker answers would bypass page.route.
test.use({ serviceWorkers: 'block' });

/** Answers in place of the feedback service and records every body it gets. */
async function mockService(page: Page, status = 201, body: unknown = { ok: true }) {
	const received: unknown[] = [];
	await page.route(`${SERVICE}/**`, async (route) => {
		const request = route.request();
		const cors = {
			'Access-Control-Allow-Origin': new URL(page.url()).origin,
			'Access-Control-Allow-Methods': 'POST',
			'Access-Control-Allow-Headers': 'Content-Type, Accept-Language'
		};
		if (request.method() === 'OPTIONS') {
			await route.fulfill({ status: 204, headers: cors });
			return;
		}
		expect(request.url()).toBe(ENDPOINT);
		received.push(request.postDataJSON());
		await route.fulfill({ status, headers: cors, json: body });
	});
	return received;
}

async function fillForm(page: Page) {
	await page.getByLabel('Ein Wunsch oder eine Idee').check();
	await page.getByLabel('Deine Nachricht').fill('Eine Erinnerung an Telefonzeiten wäre schön.');
}

test('the feedback page says what is sent and is reachable from the app', async ({ page }) => {
	await page.goto('mehr/');
	await page.getByRole('link', { name: 'Feedback geben' }).first().click();
	await expect(page).toHaveURL(/\/feedback\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Feedback geben');
	await expect(page.getByText('Nur was du unten eintippst.')).toBeVisible();
	await expect(page.getByText('Der Text geht über Cloudflare')).toBeVisible();
	await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
		'content',
		new RegExp(`connect-src 'self' ${SERVICE};`)
	);
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('the about page describes where feedback goes', async ({ page }) => {
	await page.goto('ueber/');
	const section = page.locator('#feedback');
	await expect(section.getByRole('heading', { name: 'Freiwilliges Feedback' })).toBeVisible();
	await expect(section.getByText('Cloudflare Worker, USA')).toBeVisible();
	await section.getByRole('link', { name: 'Feedback-Formular' }).click();
	await expect(page).toHaveURL(/\/feedback\/$/);
});

test('sends only what was typed in, and only on the button', async ({ page }) => {
	const received = await mockService(page);
	// Something stored in the app must not end up in the feedback.
	await page.goto('app/');
	await page.getByRole('button', { name: 'Kontakt notieren' }).click();
	await page.getByLabel('Was ist passiert? Eine Zeile reicht.').fill('Praxis Geheim, Absage');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await page.goto('feedback/');
	await fillForm(page);
	await page.getByLabel('E-Mail für eine Antwort (freiwillig)').fill('ich@example.org');
	expect(received).toEqual([]);
	await page.getByRole('button', { name: 'Feedback senden' }).click();

	await expect(page.getByText('Danke! Dein Feedback ist angekommen.')).toBeVisible();
	expect(received).toEqual([
		{
			kind: 'wish',
			message: 'Eine Erinnerung an Telefonzeiten wäre schön.',
			email: 'ich@example.org',
			source: 'web',
			website: ''
		}
	]);
	expect(JSON.stringify(received)).not.toContain('Geheim');
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('shows the text of the service when it declines', async ({ page }) => {
	await mockService(page, 429, {
		ok: false,
		error: 'Du hast gerade viel gesendet. Versuch es gleich noch einmal.',
		code: 'rateLimited'
	});
	await page.goto('feedback/');
	await fillForm(page);
	await page.getByRole('button', { name: 'Feedback senden' }).click();
	await expect(page.locator('.feedback-status')).toHaveText(
		'Du hast gerade viel gesendet. Versuch es gleich noch einmal.'
	);
	await expect(page.getByLabel('Deine Nachricht')).not.toBeEmpty();
});

test('says so offline instead of failing silently', async ({ page, context }) => {
	const received = await mockService(page);
	await page.goto('feedback/');
	await fillForm(page);
	await context.setOffline(true);
	await expect(page.getByText('Du bist gerade offline.').first()).toBeVisible();
	await page.getByRole('button', { name: 'Feedback senden' }).click();
	await expect(page.locator('.feedback-status')).toContainText('Dein Text bleibt hier stehen');
	await expect(page.getByLabel('Deine Nachricht')).toHaveValue(
		'Eine Erinnerung an Telefonzeiten wäre schön.'
	);
	expect(received).toEqual([]);
	await context.setOffline(false);
});
