import type { ContactAttempt, ContactResult, Practice } from './types';
import { CONTACT_RESULTS } from './types';

/** Results that count as an unsuccessful request for the reimbursement proof. */
export const COUNTED_RESULTS: readonly ContactResult[] = ['rejected', 'waitlist', 'not_reached'];

/**
 * Orientation only: health insurers often ask for about 5 to 10 unsuccessful
 * requests. This is never a promise and never a fixed target.
 */
export const PROOF_ORIENTATION = { min: 5, max: 10 } as const;

/** Rejections on one day after which the app suggests a short break. */
export const PAUSE_AFTER_REJECTIONS = 3;

/** Attempts recorded since the last export after which the app suggests a backup. */
export const EXPORT_REMINDER_AFTER = 10;

export interface Progress {
	/** Kassenpraxen with at least one counted attempt and no appointment. */
	proofCount: number;
	attemptCount: number;
	practiceCount: number;
	byResult: Record<ContactResult, number>;
	tssContacted: boolean;
	hasAppointment: boolean;
}

/** Whether a single attempt counts as unsuccessful under the counting rule. */
export function countsForProof(attempt: ContactAttempt, practice: Practice | undefined): boolean {
	return practice?.kind === 'kassenpraxis' && COUNTED_RESULTS.includes(attempt.result);
}

/**
 * Sums up the search. A practice counts once for the proof, however often it
 * was called, so repeated calls to the same practice do not inflate the count.
 * The PDF still lists every attempt.
 */
export function computeProgress(practices: Practice[], attempts: ContactAttempt[]): Progress {
	const byId = new Map(practices.map((practice) => [practice.id, practice]));
	const byResult = Object.fromEntries(CONTACT_RESULTS.map((result) => [result, 0])) as Record<
		ContactResult,
		number
	>;
	const counted = new Set<string>();
	const withAppointment = new Set<string>();
	let tssContacted = false;

	for (const attempt of attempts) {
		byResult[attempt.result] += 1;
		const practice = byId.get(attempt.practiceId);
		if (practice?.kind === 'tss') tssContacted = true;
		if (attempt.result === 'appointment') withAppointment.add(attempt.practiceId);
		if (countsForProof(attempt, practice)) counted.add(attempt.practiceId);
	}
	for (const id of withAppointment) counted.delete(id);

	return {
		proofCount: counted.size,
		attemptCount: attempts.length,
		practiceCount: new Set(attempts.map((attempt) => attempt.practiceId)).size,
		byResult,
		tssContacted,
		hasAppointment: withAppointment.size > 0
	};
}

function sameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** True after three or more rejections on the same day as `now`. */
export function shouldSuggestPause(attempts: ContactAttempt[], now: Date = new Date()): boolean {
	const today = attempts.filter(
		(attempt) => attempt.result === 'rejected' && sameLocalDay(new Date(attempt.at), now)
	);
	return today.length >= PAUSE_AFTER_REJECTIONS;
}

/** True once enough attempts were recorded since the last export (or ever, without one). */
export function shouldRemindExport(attempts: ContactAttempt[], lastExportAt?: string): boolean {
	const since = lastExportAt ? Date.parse(lastExportAt) : -Infinity;
	const fresh = attempts.filter((attempt) => Date.parse(attempt.at) > since);
	return fresh.length >= EXPORT_REMINDER_AFTER;
}

/** Earliest and latest attempt, for the period shown in the PDF. */
export function attemptPeriod(attempts: ContactAttempt[]): { from: string; to: string } | null {
	if (attempts.length === 0) return null;
	// ISO timestamps sort by plain code unit order, which is also chronological.
	const sorted = attempts.map((attempt) => attempt.at).sort((a, b) => (a < b ? -1 : Number(a > b)));
	return { from: sorted[0], to: sorted.at(-1)! };
}

/** At most this many collected stones are drawn; more are summed up as "+n". */
export const MAX_PEBBLES = 12;
/** Open stones after the collected ones. They fade out: there is no fixed target number. */
export const OPEN_PEBBLES = 3;

/**
 * The stones for the progress card: one per proof, followed by a few fading open ones.
 * Deliberately no goal or "x of y": insurers ask for different numbers.
 */
export function proofPebbles(proofCount: number): { filled: number; open: number; more: number } {
	const count = Math.max(0, Math.floor(proofCount));
	const filled = Math.min(count, MAX_PEBBLES);
	return { filled, open: OPEN_PEBBLES, more: count - filled };
}
