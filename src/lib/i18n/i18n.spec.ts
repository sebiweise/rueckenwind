import { describe, expect, it } from 'vitest';
import { t } from './index';
import de from './de.json';

describe('t', () => {
	it('returns the German text for a key', () => {
		expect(t('footer.disclaimer')).toBe('Keine Rechts- oder Medizinberatung.');
	});

	it('has no empty texts', () => {
		for (const value of Object.values(de)) {
			expect(value.trim()).not.toBe('');
		}
	});
});

describe('t with values', () => {
	it('fills placeholders and keeps unknown ones', () => {
		expect(t('content.lastReviewed', { date: '8. Oktober 2026' })).toBe(
			'Zuletzt geprüft am 8. Oktober 2026'
		);
		expect(t('content.lastReviewed', {})).toBe('Zuletzt geprüft am {date}');
	});
});
