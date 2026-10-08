import { describe, expect, it } from 'vitest';
import {
	applyPalette,
	currentPalette,
	DEFAULT_PALETTE,
	isPalette,
	PALETTE_STORAGE_KEY,
	paletteScript
} from '.';

function fakeRoot() {
	return { dataset: {} as DOMStringMap } as HTMLElement;
}

function fakeStorage(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		data,
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, value),
		removeItem: (key: string) => void data.delete(key)
	} as unknown as Storage & { data: Map<string, string> };
}

function runScript(storage: Storage, root: HTMLElement) {
	new Function('localStorage', 'document', paletteScript)(storage, { documentElement: root });
}

describe('palettes', () => {
	it('knows the three palettes, with Salbei as default', () => {
		expect(DEFAULT_PALETTE).toBe('salbei');
		expect(isPalette('pfirsich')).toBe(true);
		expect(isPalette('himmel')).toBe(true);
		expect(isPalette('neon')).toBe(false);
		expect(isPalette(null)).toBe(false);
	});

	it('applies and stores a palette, and forgets it again for the default', () => {
		const root = fakeRoot();
		const storage = fakeStorage();
		applyPalette('himmel', root, storage);
		expect(root.dataset.palette).toBe('himmel');
		expect(storage.data.get(PALETTE_STORAGE_KEY)).toBe('himmel');
		expect(currentPalette(root)).toBe('himmel');

		applyPalette('salbei', root, storage);
		expect(root.dataset.palette).toBeUndefined();
		expect(storage.data.has(PALETTE_STORAGE_KEY)).toBe(false);
		expect(currentPalette(root)).toBe('salbei');
	});

	it('still applies the palette when storage is blocked', () => {
		const root = fakeRoot();
		const blocked = {
			setItem: () => {
				throw new Error('blocked');
			}
		} as unknown as Storage;
		applyPalette('pfirsich', root, blocked);
		expect(root.dataset.palette).toBe('pfirsich');
	});

	it('restores the stored palette before the first paint', () => {
		const root = fakeRoot();
		runScript(fakeStorage({ [PALETTE_STORAGE_KEY]: 'pfirsich' }), root);
		expect(root.dataset.palette).toBe('pfirsich');
	});

	it('ignores unknown stored values and blocked storage', () => {
		const root = fakeRoot();
		runScript(fakeStorage({ [PALETTE_STORAGE_KEY]: '"><script>' }), root);
		expect(root.dataset.palette).toBeUndefined();
		const blocked = {
			getItem: () => {
				throw new Error('blocked');
			}
		} as unknown as Storage;
		runScript(blocked, root);
		expect(root.dataset.palette).toBeUndefined();
	});
});
