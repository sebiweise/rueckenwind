/*
 * The opt-in feedback form (/feedback/). It sends only what the person types into the form,
 * never anything from the stored data, and no diagnostics. Contract of the feedback service:
 * JSON { kind, message, email?, source, website } → { ok: true } or { ok: false, error, code }.
 */

export const FEEDBACK_KINDS = ['bug', 'wish', 'other'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** Same limits as the feedback service (it counts graphemes, so this check is a little stricter). */
export const MIN_MESSAGE_LENGTH = 10;
export const MAX_MESSAGE_LENGTH = 4000;

export interface FeedbackInput {
	kind: FeedbackKind;
	message: string;
	email: string;
	/** Honeypot: a hidden field only bots fill in. The service then files nothing. */
	website: string;
}

export type FeedbackResult =
	| { ok: true }
	| { ok: false; reason: 'tooShort' | 'offline' | 'network' | 'failed' }
	/** The service declined with a text meant for people (German, from Accept-Language). */
	| { ok: false; reason: 'rejected'; error: string };

/** Request body for the service: nothing but the form fields, trimmed; no empty e-mail. */
export function feedbackBody(input: FeedbackInput) {
	const email = input.email.trim();
	return {
		kind: input.kind,
		message: input.message.trim(),
		...(email && { email }),
		source: 'web',
		website: input.website
	};
}

const TIMEOUT_MS = 15_000;

interface SendOptions {
	fetch?: typeof fetch;
	isOnline?: () => boolean;
}

/** Sends the feedback. Offline it does not even try, so the form can say so right away. */
export async function sendFeedback(
	endpoint: URL,
	input: FeedbackInput,
	{
		fetch: fetchFn = globalThis.fetch,
		isOnline = () => globalThis.navigator?.onLine ?? true
	}: SendOptions = {}
): Promise<FeedbackResult> {
	const body = feedbackBody(input);
	if ([...body.message].length < MIN_MESSAGE_LENGTH) return { ok: false, reason: 'tooShort' };
	if (!isOnline()) return { ok: false, reason: 'offline' };

	let response: Response;
	try {
		response = await fetchFn(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept-Language': 'de' },
			body: JSON.stringify(body),
			// No cookies, no referrer: the service needs neither.
			credentials: 'omit',
			referrerPolicy: 'no-referrer',
			signal: AbortSignal.timeout(TIMEOUT_MS)
		});
	} catch {
		return { ok: false, reason: isOnline() ? 'network' : 'offline' };
	}

	const data: unknown = await response.json().catch(() => null);
	if (response.ok && isObject(data) && data.ok === true) return { ok: true };
	if (isObject(data) && typeof data.error === 'string' && data.error.trim()) {
		return { ok: false, reason: 'rejected', error: data.error };
	}
	return { ok: false, reason: 'failed' };
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}
