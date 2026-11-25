import { describe, expect, it, vi } from 'vitest';
import { feedbackBody, sendFeedback, type FeedbackInput } from './feedback';

const endpoint = new URL('https://feedback.example.org/v1/feedback/rueckenwind');
const input: FeedbackInput = {
	kind: 'wish',
	message: '  Eine Erinnerung an Telefonzeiten wäre schön.  ',
	email: '',
	website: ''
};

function reply(status: number, body: unknown) {
	return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe('feedbackBody', () => {
	it('sends only the form fields, trimmed, and leaves out an empty e-mail', () => {
		expect(feedbackBody(input)).toEqual({
			kind: 'wish',
			message: 'Eine Erinnerung an Telefonzeiten wäre schön.',
			source: 'web',
			website: ''
		});
		expect(feedbackBody({ ...input, email: ' ich@example.org ' }).email).toBe('ich@example.org');
	});
});

describe('sendFeedback', () => {
	it('posts JSON in German without cookies or referrer', async () => {
		const fetch = reply(201, { ok: true });
		await expect(sendFeedback(endpoint, input, { fetch, isOnline: () => true })).resolves.toEqual({
			ok: true
		});
		const [url, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
		expect(String(url)).toBe(endpoint.href);
		expect(init).toMatchObject({
			method: 'POST',
			credentials: 'omit',
			referrerPolicy: 'no-referrer',
			headers: { 'Content-Type': 'application/json', 'Accept-Language': 'de' }
		});
		expect(JSON.parse(init.body as string)).toEqual(feedbackBody(input));
	});

	it('does not send a text that is too short', async () => {
		const fetch = reply(201, { ok: true });
		const result = await sendFeedback(
			endpoint,
			{ ...input, message: '  kurz   ' },
			{ fetch, isOnline: () => true }
		);
		expect(result).toEqual({ ok: false, reason: 'tooShort' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('says so offline instead of trying', async () => {
		const fetch = reply(201, { ok: true });
		const result = await sendFeedback(endpoint, input, { fetch, isOnline: () => false });
		expect(result).toEqual({ ok: false, reason: 'offline' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('tells a lost connection from other network errors', async () => {
		let online = true;
		const fetch = vi.fn(async () => {
			online = false;
			throw new TypeError('Failed to fetch');
		});
		await expect(sendFeedback(endpoint, input, { fetch, isOnline: () => online })).resolves.toEqual(
			{ ok: false, reason: 'offline' }
		);
		const blocked = vi.fn(async () => {
			throw new TypeError('Failed to fetch');
		});
		await expect(
			sendFeedback(endpoint, input, { fetch: blocked, isOnline: () => true })
		).resolves.toEqual({ ok: false, reason: 'network' });
	});

	it('passes on the text of the service', async () => {
		const fetch = reply(429, { ok: false, error: 'Bitte warte kurz.', code: 'rateLimited' });
		await expect(sendFeedback(endpoint, input, { fetch, isOnline: () => true })).resolves.toEqual({
			ok: false,
			reason: 'rejected',
			error: 'Bitte warte kurz.'
		});
	});

	it('falls back to a general failure without a usable answer', async () => {
		for (const fetch of [
			reply(502, { ok: false }),
			reply(200, { ok: false, error: '  ' }),
			vi.fn(async () => new Response('<html>', { status: 500 }))
		]) {
			await expect(sendFeedback(endpoint, input, { fetch, isOnline: () => true })).resolves.toEqual(
				{ ok: false, reason: 'failed' }
			);
		}
	});
});
