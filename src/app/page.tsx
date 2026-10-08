import Link from 'next/link';
import { APP_NAME, APP_SUBTITLE } from '@/lib/config';
import { loadStages } from '@/lib/content';
import { t } from '@/lib/i18n';

export default function Home() {
	const stages = loadStages();
	return (
		<>
			<h1>
				{APP_NAME} <span className="subtitle">{APP_SUBTITLE}</span>
			</h1>
			<p>{t('home.lead')}</p>
			<p>{t('home.promise')}</p>
			<h2>{t('nav.stages')}</h2>
			<p>{t('home.stagesIntro')}</p>
			<ol className="stage-links">
				{stages.map((stage) => (
					<li key={stage.slug}>
						<Link href={`/etappe/${stage.stage}/`}>{stage.title}</Link>
					</li>
				))}
			</ol>
		</>
	);
}
