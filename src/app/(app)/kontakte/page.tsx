import type { Metadata } from 'next';
import { ContactsView } from '@/components/ContactsView';
import { ProgressSummary } from '@/components/ProgressSummary';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('contacts.title')} – ${APP_NAME}` };

export default function ContactsPage() {
	return (
		<>
			<h1>{t('contacts.title')}</h1>
			<p className="lead">{t('contacts.lead')}</p>
			<ProgressSummary />
			<ContactsView />
		</>
	);
}
