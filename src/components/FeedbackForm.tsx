'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { CheckIcon } from '@/components/Icons';
import { FEEDBACK_ENDPOINT } from '@/lib/config';
import {
	FEEDBACK_KINDS,
	MAX_MESSAGE_LENGTH,
	sendFeedback,
	type FeedbackKind,
	type FeedbackResult
} from '@/lib/feedback';
import { t } from '@/lib/i18n';

function subscribeOnline(onChange: () => void) {
	globalThis.addEventListener('online', onChange);
	globalThis.addEventListener('offline', onChange);
	return () => {
		globalThis.removeEventListener('online', onChange);
		globalThis.removeEventListener('offline', onChange);
	};
}

/** Online status of the browser; the prerendered page assumes online. */
function useOnline() {
	return useSyncExternalStore(
		subscribeOnline,
		() => navigator.onLine,
		() => true
	);
}

function failureText(result: Exclude<FeedbackResult, { ok: true }>): string {
	if (result.reason === 'rejected') return result.error;
	return t(`feedback.${result.reason}`);
}

/**
 * The opt-in feedback form. Its fields live only in this component: nothing is stored, and
 * nothing from the app's data is added. Sends only on the button, never on its own.
 */
export function FeedbackForm() {
	const id = useId();
	const online = useOnline();
	const [kind, setKind] = useState<FeedbackKind>('bug');
	const [message, setMessage] = useState('');
	const [email, setEmail] = useState('');
	const [website, setWebsite] = useState('');
	const [busy, setBusy] = useState(false);
	const [sent, setSent] = useState(false);
	const [status, setStatus] = useState('');

	if (!FEEDBACK_ENDPOINT) return <p className="notice">{t('feedback.unavailable')}</p>;
	const endpoint = FEEDBACK_ENDPOINT;

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setStatus(t('feedback.sending'));
		const result = await sendFeedback(endpoint, { kind, message, email, website });
		setBusy(false);
		if (result.ok) {
			setMessage('');
			setEmail('');
			setSent(true);
			setStatus(t('feedback.sent'));
		} else {
			setStatus(failureText(result));
		}
	}

	function again() {
		setSent(false);
		setStatus('');
	}

	if (sent) {
		return (
			<section className="feature" aria-labelledby={`${id}-sent`}>
				<p id={`${id}-sent`} className="check-line" role="status">
					<CheckIcon />
					{status}
				</p>
				<button type="button" className="button" onClick={again}>
					{t('feedback.again')}
				</button>
			</section>
		);
	}

	return (
		<form className="feature feedback-form" onSubmit={submit} noValidate>
			<fieldset>
				<legend>{t('feedback.kind')}</legend>
				{FEEDBACK_KINDS.map((value) => (
					<label key={value} className="option">
						<input
							type="radio"
							name={`${id}-kind`}
							value={value}
							checked={kind === value}
							onChange={() => setKind(value)}
						/>
						{t(`feedback.kind.${value}`)}
					</label>
				))}
			</fieldset>
			<div className="form">
				<label htmlFor={`${id}-message`}>{t('feedback.message')}</label>
				<textarea
					id={`${id}-message`}
					rows={6}
					required
					maxLength={MAX_MESSAGE_LENGTH}
					value={message}
					aria-describedby={`${id}-message-hint`}
					onChange={(event) => setMessage(event.target.value)}
				/>
				<p id={`${id}-message-hint`} className="muted">
					{t('feedback.messageHint')}
				</p>
			</div>
			<div className="form">
				<label htmlFor={`${id}-email`}>{t('feedback.email')}</label>
				<input
					id={`${id}-email`}
					type="email"
					autoComplete="email"
					value={email}
					aria-describedby={`${id}-email-hint`}
					onChange={(event) => setEmail(event.target.value)}
				/>
				<p id={`${id}-email-hint`} className="muted">
					{t('feedback.emailHint')}
				</p>
			</div>
			{/* Honeypot: hidden from people and screen readers, only bots fill it in. */}
			<div className="visually-hidden" aria-hidden="true">
				<label htmlFor={`${id}-website`}>{t('feedback.honeypot')}</label>
				<input
					id={`${id}-website`}
					type="text"
					name="website"
					tabIndex={-1}
					autoComplete="off"
					value={website}
					onChange={(event) => setWebsite(event.target.value)}
				/>
			</div>
			{!online && <p className="notice">{t('feedback.offlineNotice')}</p>}
			<button type="submit" className="button button-primary button-wide" disabled={busy}>
				{t('feedback.send')}
			</button>
			<p className="feedback-status" role="status" aria-live="polite">
				{status}
			</p>
		</form>
	);
}
