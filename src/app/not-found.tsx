import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { t } from '@/lib/i18n';

/** 404 page; it keeps the header, so the crisis button is here too. */
export default function NotFound() {
	return (
		<>
			<SiteHeader home="/" />
			<main>
				<h1>{t('notFound.title')}</h1>
				<p>
					<Link href="/app/">{t('notFound.link')}</Link>
				</p>
			</main>
		</>
	);
}
