import { describe, expect, it } from 'vitest';
import {
	formatDate,
	formatDateTime,
	formatRelativeDateTime,
	formatWaitTime,
	fromDateTimeLocal,
	toDateTimeLocal
} from './format';

describe('formatWaitTime', () => {
	it.each([
		[1, '1 Woche'],
		[6, '6 Wochen'],
		[9, 'ca. 2 Monate'],
		[35, 'ca. 8 Monate'],
		[52, 'ca. 12 Monate'],
		[78, 'ca. 1,5 Jahre'],
		[104, 'ca. 2 Jahre']
	])('%i weeks → %s', (weeks, text) => {
		expect(formatWaitTime(weeks)).toBe(text);
	});

	it('switches to years from 18 months on', () => {
		expect(formatWaitTime(80)).toBe('ca. 1,5 Jahre');
		expect(formatWaitTime(95)).toBe('ca. 2 Jahre');
	});
});

describe('date helpers', () => {
	it('round-trips datetime-local values', () => {
		const iso = new Date(2026, 9, 8, 9, 30).toISOString();
		expect(toDateTimeLocal(iso)).toBe('2026-10-08T09:30');
		expect(fromDateTimeLocal('2026-10-08T09:30')).toBe(iso);
		expect(fromDateTimeLocal('')).toBeNull();
		expect(fromDateTimeLocal('kaputt')).toBeNull();
	});

	it('formats dates in German', () => {
		const iso = new Date(2026, 9, 8, 9, 30).toISOString();
		expect(formatDate(iso)).toBe('08.10.2026');
		expect(formatDateTime(iso)).toBe('08.10.2026, 09:30');
	});
});

describe('formatRelativeDateTime', () => {
	const now = new Date(2026, 9, 9, 18, 0);

	it('says today and yesterday in words', () => {
		expect(formatRelativeDateTime(new Date(2026, 9, 9, 8, 30).toISOString(), now)).toBe(
			'Heute, 08:30'
		);
		expect(formatRelativeDateTime(new Date(2026, 9, 8, 22, 15).toISOString(), now)).toBe(
			'Gestern, 22:15'
		);
	});

	it('falls back to the full date for older entries', () => {
		const iso = new Date(2026, 8, 1, 8, 30).toISOString();
		expect(formatRelativeDateTime(iso, now)).toBe(formatDateTime(iso));
	});
});
