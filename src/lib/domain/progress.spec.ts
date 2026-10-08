import { describe, expect, it } from 'vitest';
import {
	attemptPeriod,
	computeProgress,
	countsForProof,
	EXPORT_REMINDER_AFTER,
	shouldRemindExport,
	shouldSuggestPause
} from './progress';
import type { ContactAttempt, ContactResult, Practice, PracticeKind } from './types';

function practice(id: string, kind: PracticeKind = 'kassenpraxis'): Practice {
	return { id, name: `Praxis ${id}`, kind, createdAt: '2026-10-01T08:00:00.000Z' };
}

let counter = 0;
function attempt(
	practiceId: string,
	result: ContactResult,
	at = '2026-10-08T08:00:00.000Z'
): ContactAttempt {
	counter += 1;
	return { id: `a${counter}`, practiceId, at, channel: 'phone', result };
}

describe('countsForProof', () => {
	it.each<[ContactResult, boolean]>([
		['rejected', true],
		['waitlist', true],
		['not_reached', true],
		['voicemail', false],
		['callback_pending', false],
		['appointment', false],
		['other', false]
	])('%s at a Kassenpraxis → %s', (result, expected) => {
		expect(countsForProof(attempt('p', result), practice('p'))).toBe(expected);
	});

	it('only counts Kassenpraxen', () => {
		for (const kind of ['privatpraxis', 'institut', 'tss', 'other'] as const) {
			expect(countsForProof(attempt('p', 'rejected'), practice('p', kind))).toBe(false);
		}
		expect(countsForProof(attempt('p', 'rejected'), undefined)).toBe(false);
	});
});

describe('computeProgress', () => {
	it('is empty without data', () => {
		const progress = computeProgress([], []);
		expect(progress.proofCount).toBe(0);
		expect(progress.attemptCount).toBe(0);
		expect(progress.practiceCount).toBe(0);
		expect(progress.tssContacted).toBe(false);
		expect(progress.hasAppointment).toBe(false);
		expect(progress.byResult.rejected).toBe(0);
	});

	it('counts each practice once, however often it was called', () => {
		const practices = [practice('a'), practice('b'), practice('c')];
		const attempts = [
			attempt('a', 'not_reached'),
			attempt('a', 'not_reached'),
			attempt('a', 'rejected'),
			attempt('b', 'waitlist'),
			attempt('c', 'voicemail')
		];
		const progress = computeProgress(practices, attempts);
		expect(progress.proofCount).toBe(2);
		expect(progress.attemptCount).toBe(5);
		expect(progress.practiceCount).toBe(3);
		expect(progress.byResult.not_reached).toBe(2);
	});

	it('does not count a practice that later gave an appointment', () => {
		const practices = [practice('a'), practice('b')];
		const attempts = [
			attempt('a', 'waitlist'),
			attempt('a', 'appointment'),
			attempt('b', 'rejected')
		];
		const progress = computeProgress(practices, attempts);
		expect(progress.proofCount).toBe(1);
		expect(progress.hasAppointment).toBe(true);
	});

	it('notices contact with the Terminservicestelle', () => {
		const progress = computeProgress([practice('t', 'tss')], [attempt('t', 'other')]);
		expect(progress.tssContacted).toBe(true);
		expect(progress.proofCount).toBe(0);
	});

	it('ignores attempts whose practice is missing', () => {
		expect(computeProgress([], [attempt('gone', 'rejected')]).proofCount).toBe(0);
	});
});

describe('shouldSuggestPause', () => {
	const now = new Date('2026-10-08T15:00:00');
	const today = (hour: number) => new Date(`2026-10-08T${hour}:00:00`).toISOString();

	it('suggests a pause after three rejections today', () => {
		const attempts = [10, 11, 12].map((h) => attempt('a', 'rejected', today(h)));
		expect(shouldSuggestPause(attempts, now)).toBe(true);
	});

	it('does not after two rejections or other results', () => {
		const attempts = [
			attempt('a', 'rejected', today(10)),
			attempt('a', 'rejected', today(11)),
			attempt('a', 'not_reached', today(12)),
			attempt('a', 'waitlist', today(13))
		];
		expect(shouldSuggestPause(attempts, now)).toBe(false);
	});

	it('only counts today', () => {
		const yesterday = new Date('2026-10-07T12:00:00').toISOString();
		const attempts = [
			attempt('a', 'rejected', yesterday),
			attempt('a', 'rejected', today(10)),
			attempt('a', 'rejected', today(11))
		];
		expect(shouldSuggestPause(attempts, now)).toBe(false);
	});

	it('defaults to the current time', () => {
		const attempts = [1, 2, 3].map(() => attempt('a', 'rejected', new Date().toISOString()));
		expect(shouldSuggestPause(attempts)).toBe(true);
	});
});

describe('shouldRemindExport', () => {
	const many = Array.from({ length: EXPORT_REMINDER_AFTER }, (_, i) =>
		attempt('a', 'rejected', new Date(Date.UTC(2026, 9, 1 + i)).toISOString())
	);

	it('reminds after ten attempts without any export', () => {
		expect(shouldRemindExport(many)).toBe(true);
		expect(shouldRemindExport(many.slice(1))).toBe(false);
	});

	it('only counts attempts after the last export', () => {
		expect(shouldRemindExport(many, '2026-10-05T00:00:00.000Z')).toBe(false);
		expect(shouldRemindExport(many, '2026-09-01T00:00:00.000Z')).toBe(true);
	});
});

describe('attemptPeriod', () => {
	it('is null without attempts', () => {
		expect(attemptPeriod([])).toBeNull();
	});

	it('returns the first and last date', () => {
		const attempts = [
			attempt('a', 'rejected', '2026-10-05T10:00:00.000Z'),
			attempt('a', 'rejected', '2026-09-01T10:00:00.000Z'),
			attempt('a', 'rejected', '2026-10-07T10:00:00.000Z')
		];
		expect(attemptPeriod(attempts)).toEqual({
			from: '2026-09-01T10:00:00.000Z',
			to: '2026-10-07T10:00:00.000Z'
		});
	});
});
