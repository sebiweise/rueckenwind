'use client';

import { useInstallWay, useStandalone } from '@/lib/install/hooks';
import { showInstallPrompt } from '@/lib/install/prompt';
import { t } from '@/lib/i18n';
import { CheckCircleIcon } from './Icons';

/** On the install page: "already installed", or the browser's own install button when it has one. */
export function InstallStatus() {
	const standalone = useStandalone();
	const way = useInstallWay();

	if (standalone) {
		return (
			<p className="notice install-status" role="status">
				<CheckCircleIcon className="icon icon-inline" />
				{t('install.done')}
			</p>
		);
	}
	if (way !== 'prompt') return null;
	return (
		<div className="notice install-status">
			<p>{t('install.ready')}</p>
			<p>
				<button
					type="button"
					className="button button-primary"
					onClick={() => void showInstallPrompt()}
				>
					{t('install.button')}
				</button>
			</p>
		</div>
	);
}
