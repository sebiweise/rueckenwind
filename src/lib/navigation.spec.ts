import { describe, expect, it } from 'vitest';
import { sectionOf } from './navigation';

describe('sectionOf', () => {
	it('maps pages to their navigation tab', () => {
		expect(sectionOf('/')).toBe('home');
		expect(sectionOf('/etappe/3/')).toBe('home');
		expect(sectionOf('/kontakte/')).toBe('contacts');
		expect(sectionOf('/daten')).toBe('data');
		expect(sectionOf('/mehr/')).toBe('more');
		expect(sectionOf('/hilfen/')).toBe('more');
		expect(sectionOf('/ueber/')).toBe('more');
		expect(sectionOf('/krise/')).toBeNull();
	});
});
