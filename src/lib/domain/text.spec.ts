import { describe, expect, it } from 'vitest';
import { editDistance, fold } from './text';

describe('fold', () => {
	it('spells out umlauts and lowers case', () => {
		expect(fold('Rückruf  ÄRGER Größe')).toBe('rueckruf aerger groesse');
	});

	it('unifies dashes and trims', () => {
		expect(fold('  3 – 4 — 5 ')).toBe('3 - 4 - 5');
	});
});

describe('editDistance', () => {
	it.each([
		['absage', 'absage', 0],
		['abasge', 'absage', 1],
		['wartelsite', 'warteliste', 1],
		['ruckruf', 'rueckruf', 1],
		['', 'ab', 2],
		['termin', 'praxis', 5]
	])('%s ↔ %s = %i', (a, b, distance) => {
		expect(editDistance(a, b)).toBe(distance);
	});
});
