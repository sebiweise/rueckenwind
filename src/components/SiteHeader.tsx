import Link from 'next/link';
import { HeartIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

/** Header with the app name and the crisis button, which is on every page. */
export function SiteHeader({ home }: Readonly<{ home: string }>) {
	return (
		<header className="site-header">
			<Link href={home} className="brand">
				<Logo />
				{APP_NAME}
			</Link>
			<Link href="/krise/" className="crisis-button">
				<HeartIcon />
				{t('nav.crisisShort')}
			</Link>
		</header>
	);
}
