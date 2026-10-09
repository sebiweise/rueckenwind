import { describe, expect, it } from 'vitest';
import {
	INSTALL_DISMISSED_KEY,
	dismissInstall,
	installWay,
	isInstallDismissed,
	isIos,
	isStandalone
} from '.';

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const ANDROID =
	'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';

function memoryStorage(): Storage {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => void values.set(key, value)
	} as Storage;
}

const blockedStorage = {
	getItem: () => {
		throw new Error('blocked');
	},
	setItem: () => {
		throw new Error('blocked');
	}
} as unknown as Storage;

describe('isIos', () => {
	it('detects iPhone and iPad', () => {
		expect(isIos(IPHONE)).toBe(true);
		expect(isIos(MAC, 5)).toBe(true);
	});

	it('does not mistake a Mac or Android for iOS', () => {
		expect(isIos(MAC, 0)).toBe(false);
		expect(isIos(ANDROID, 5)).toBe(false);
	});
});

describe('isStandalone', () => {
	it('reads display-mode and the iOS flag', () => {
		expect(isStandalone(() => ({ matches: true }))).toBe(true);
		expect(isStandalone(() => ({ matches: false }), true)).toBe(true);
		expect(isStandalone(() => ({ matches: false }), false)).toBe(false);
		expect(isStandalone(undefined)).toBe(false);
	});
});

describe('installWay', () => {
	it('offers nothing in the installed app', () => {
		expect(installWay({ standalone: true, hasPrompt: true, ios: true })).toBe('none');
	});

	it('prefers the browser’s own dialog', () => {
		expect(installWay({ standalone: false, hasPrompt: true, ios: false })).toBe('prompt');
	});

	it('shows the steps on iOS', () => {
		expect(installWay({ standalone: false, hasPrompt: false, ios: true })).toBe('ios');
	});

	it('stays quiet when the browser cannot say', () => {
		expect(installWay({ standalone: false, hasPrompt: false, ios: false })).toBe('none');
	});
});

describe('dismissing the banner', () => {
	it('is remembered on this device', () => {
		const storage = memoryStorage();
		expect(isInstallDismissed(storage)).toBe(false);
		dismissInstall(storage);
		expect(storage.getItem(INSTALL_DISMISSED_KEY)).toBe('1');
		expect(isInstallDismissed(storage)).toBe(true);
	});

	it('copes with missing or blocked storage', () => {
		expect(isInstallDismissed(undefined)).toBe(false);
		expect(isInstallDismissed(blockedStorage)).toBe(false);
		expect(() => dismissInstall(blockedStorage)).not.toThrow();
	});
});
