'use client';

import Link from 'next/link';
import { dismissInstall } from '@/lib/install';
import { installStorage, useInstallDismissed, useInstallWay } from '@/lib/install/hooks';
import { refreshInstallState, showInstallPrompt } from '@/lib/install/prompt';
import { t } from '@/lib/i18n';
import { HomeScreenIcon, ShareIcon } from './Icons';

/**
 * A quiet suggestion to put the app on the home screen. Only shows when the browser can
 * install it (or on iPhone and iPad), never in the installed app, and stays away after
 * "Nicht jetzt".
 */
export function InstallBanner() {
	const way = useInstallWay();
	const dismissed = useInstallDismissed();
	if (way === 'none' || dismissed) return null;

	function later() {
		dismissInstall(installStorage());
		refreshInstallState();
	}

	return (
		<aside className="notice install-banner" aria-labelledby="install-banner-title">
			<span className="install-banner-icon">
				<HomeScreenIcon />
			</span>
			<div className="install-banner-body">
				<p id="install-banner-title" className="install-banner-title">
					{t('install.bannerTitle')}
				</p>
				<p>{t('install.bannerText')}</p>
				{way === 'ios' && (
					<p className="install-banner-ios">
						<ShareIcon className="icon icon-inline" />
						{t('install.bannerIos')}
					</p>
				)}
				<p className="hint-actions">
					{way === 'prompt' ? (
						<button
							type="button"
							className="button button-primary"
							onClick={() => void showInstallPrompt()}
						>
							{t('install.button')}
						</button>
					) : (
						<Link href="/installieren/">{t('install.howTo')}</Link>
					)}
					<button type="button" className="button button-quiet" onClick={later}>
						{t('install.later')}
					</button>
				</p>
			</div>
		</aside>
	);
}
