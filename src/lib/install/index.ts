/**
 * Installing the app on the home screen. Chrome, Edge and Samsung Internet offer their own
 * install dialog (`beforeinstallprompt`); Safari on iPhone and iPad only has "Zum
 * Home-Bildschirm" in the share menu, so there we show the steps instead.
 */

/** The event Chromium browsers fire when the app can be installed. Not in the DOM types yet. */
export interface InstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** localStorage key for "Nicht jetzt" on the install banner. A display preference, no health data. */
export const INSTALL_DISMISSED_KEY = 'rueckenwind.installDismissed';

/** How the app gets onto the home screen here: own dialog, iOS share menu, or not known. */
export type InstallWay = 'prompt' | 'ios' | 'none';

/** iPhone, iPad and iPod. iPadOS reports itself as a Mac, but with a touch screen. */
export function isIos(userAgent: string, maxTouchPoints = 0): boolean {
	return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

/** True when the page runs as the installed app. */
export function isStandalone(
	matchMedia: ((query: string) => { matches: boolean }) | undefined,
	navigatorStandalone?: boolean
): boolean {
	return (
		matchMedia?.('(display-mode: standalone)').matches === true || navigatorStandalone === true
	);
}

/** Which way to offer, given what the browser told us. */
export function installWay(options: {
	standalone: boolean;
	hasPrompt: boolean;
	ios: boolean;
}): InstallWay {
	if (options.standalone) return 'none';
	if (options.hasPrompt) return 'prompt';
	if (options.ios) return 'ios';
	return 'none';
}

/** Whether the banner was put away on this device. Blocked storage counts as not dismissed. */
export function isInstallDismissed(storage?: Storage): boolean {
	try {
		return storage?.getItem(INSTALL_DISMISSED_KEY) === '1';
	} catch {
		return false;
	}
}

/** Remembers "Nicht jetzt" on this device. */
export function dismissInstall(storage?: Storage): void {
	try {
		storage?.setItem(INSTALL_DISMISSED_KEY, '1');
	} catch {
		// Storage can be blocked (private mode); the banner then stays hidden for this page only.
	}
}
