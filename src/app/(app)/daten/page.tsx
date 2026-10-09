import type { Metadata } from 'next';
import { DataSettings } from '@/components/DataSettings';
import { ProofExport } from '@/components/ProofExport';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('data.title')} – ${APP_NAME}` };

export default function DataPage() {
	return (
		<>
			<header className="page-head">
				<h1>{t('data.title')}</h1>
				<p className="muted">{t('data.lead')}</p>
			</header>
			<ProofExport />
			<DataSettings />
		</>
	);
}
