import { useSyncExternalStore } from 'react';
import { installWay, isInstallDismissed, isIos, isStandalone, type InstallWay } from '.';
import { installPrompt, subscribeInstallPrompt } from './prompt';

const serverNull = () => null;
const serverFalse = () => false;

function readStorage(): Storage | undefined {
	try {
		return globalThis.localStorage;
	} catch {
		return undefined;
	}
}

function readStandalone(): boolean {
	return isStandalone(
		globalThis.matchMedia?.bind(globalThis),
		(navigator as Navigator & { standalone?: boolean }).standalone
	);
}

/** True when the page runs as the installed app. */
export function useStandalone(): boolean {
	return useSyncExternalStore(subscribeInstallPrompt, readStandalone, serverFalse);
}

/** How the app can be installed in this browser. Always 'none' while rendering on the server. */
export function useInstallWay(): InstallWay {
	const prompt = useSyncExternalStore(subscribeInstallPrompt, installPrompt, serverNull);
	const standalone = useStandalone();
	const ios = useSyncExternalStore(
		subscribeInstallPrompt,
		() => isIos(navigator.userAgent, navigator.maxTouchPoints),
		serverFalse
	);
	return installWay({ standalone, hasPrompt: prompt !== null, ios });
}

/** Whether the install banner was put away on this device. True on the server, so it never flashes. */
export function useInstallDismissed(): boolean {
	return useSyncExternalStore(
		subscribeInstallPrompt,
		() => isInstallDismissed(readStorage()),
		() => true
	);
}

export { readStorage as installStorage };
