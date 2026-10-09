import type { Metadata } from 'next';
import Link from 'next/link';
import { InstallStatus } from '@/components/InstallStatus';
import { APP_NAME } from '@/lib/config';
import { t, type MessageKey } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('install.title')} – ${APP_NAME}` };

const GUIDES: { id: string; title: MessageKey; steps: MessageKey[]; note?: MessageKey }[] = [
	{
		id: 'ios',
		title: 'install.iosTitle',
		steps: ['install.ios1', 'install.ios2', 'install.ios3', 'install.ios4'],
		note: 'install.iosStorage'
	},
	{
		id: 'android',
		title: 'install.androidTitle',
		steps: ['install.android1', 'install.android2', 'install.android3', 'install.android4']
	},
	{
		id: 'computer',
		title: 'install.desktopTitle',
		steps: ['install.desktop1', 'install.desktop2', 'install.desktop3']
	}
];

/** How to put the app on the home screen, for each kind of device. */
export default function InstallPage() {
	return (
		<>
			<header className="page-head">
				<h1>{t('install.title')}</h1>
				<p className="lead">{t('install.lead')}</p>
			</header>
			<p>{t('install.why')}</p>
			<InstallStatus />
			{GUIDES.map((guide) => (
				<section
					key={guide.id}
					id={guide.id}
					className="card"
					aria-labelledby={`${guide.id}-title`}
				>
					<h2 id={`${guide.id}-title`}>{t(guide.title)}</h2>
					<ol className="install-steps">
						{guide.steps.map((step) => (
							<li key={step}>{t(step)}</li>
						))}
					</ol>
					{guide.note && <p className="muted">{t(guide.note)}</p>}
				</section>
			))}
			<p className="muted">
				{t('install.backup')} <Link href="/daten/#daten">{t('more.data')}</Link>
			</p>
		</>
	);
}
