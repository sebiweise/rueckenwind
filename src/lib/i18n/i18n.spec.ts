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
