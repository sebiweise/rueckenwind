import { Hints } from '@/components/Hints';
import { JourneyView } from '@/components/JourneyView';
import { ProgressSummary } from '@/components/ProgressSummary';
import { APP_NAME, APP_SUBTITLE } from '@/lib/config';
import { loadStages } from '@/lib/content';
import type { StageNumber } from '@/lib/domain';
import { t } from '@/lib/i18n';

export default function Home() {
	const pages = loadStages();
	const stages = pages.map((page) => ({
		stage: page.stage as StageNumber,
		title: page.title,
		summary: page.summary
	}));
	const steps = pages.flatMap((page) => page.steps);

	return (
		<>
			<h1>
				{APP_NAME} <span className="subtitle">{APP_SUBTITLE}</span>
			</h1>
			<p className="lead">{t('home.lead')}</p>
			<Hints />
			<JourneyView stages={stages} steps={steps} />
			<ProgressSummary linkToContacts />
			<p className="muted">{t('home.promise')}</p>
		</>
	);
}
