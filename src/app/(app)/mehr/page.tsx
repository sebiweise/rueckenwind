import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemePicker } from '@/components/ThemePicker';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('more.title')} – ${APP_NAME}` };

const LINKS = [
	{ href: '/hilfen/', label: t('nav.helpers') },
	{ href: '/krise/', label: t('nav.crisis') },
	{ href: '/ueber/', label: t('nav.about') },
	{ href: '/hinweis/', label: t('footer.disclaimer') }
];

export default function MorePage() {
	return (
		<>
			<h1>{t('more.title')}</h1>
			<p className="lead">{t('more.lead')}</p>
			<ul className="link-list">
				{LINKS.map((link) => (
					<li key={link.href}>
						<Link href={link.href}>{link.label}</Link>
					</li>
				))}
			</ul>
			<ThemePicker />
		</>
	);
}
