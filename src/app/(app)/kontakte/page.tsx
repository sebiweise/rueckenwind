import type { Metadata } from 'next';
import { ContactsView } from '@/components/ContactsView';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('contacts.title')} – ${APP_NAME}` };

export default function ContactsPage() {
	return (
		<>
			<header className="page-head">
				<h1>{t('contacts.title')}</h1>
				<p className="muted">{t('contacts.lead')}</p>
			</header>
			<ContactsView />
		</>
	);
}
