import type { Metadata } from 'next';
import { DataView } from '@/components/DataView';
import { ProofExport } from '@/components/ProofExport';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('data.title')} – ${APP_NAME}` };

export default function DataPage() {
	return (
		<>
			<h1>{t('data.title')}</h1>
			<p className="lead">{t('data.lead')}</p>
			<ProofExport />
			<DataView />
		</>
	);
}
