import { describe, expect, it } from 'vitest';
import { isReviewOverdue } from './review';

describe('isReviewOverdue', () => {
	it('is fine within twelve months', () => {
		expect(isReviewOverdue('2026-10-08', new Date('2027-10-07T12:00:00'))).toBe(false);
	});

	it('is overdue after twelve months', () => {
		expect(isReviewOverdue('2026-10-08', new Date('2027-10-09T12:00:00'))).toBe(true);
	});

	it('treats a broken date as overdue', () => {
		expect(isReviewOverdue('irgendwann', new Date('2026-10-08T12:00:00'))).toBe(true);
	});

	it('uses the current time by default', () => {
		expect(isReviewOverdue('2000-01-01')).toBe(true);
	});
});
