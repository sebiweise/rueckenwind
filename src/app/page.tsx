import { APP_NAME, APP_SUBTITLE } from '@/lib/config';
import { t } from '@/lib/i18n';

export default function Home() {
	return (
		<>
			<h1>
				{APP_NAME} <span className="subtitle">{APP_SUBTITLE}</span>
			</h1>
			<p>{t('home.lead')}</p>
			<p>{t('home.promise')}</p>
			<p className="muted">{t('home.status')}</p>
		</>
	);
}
