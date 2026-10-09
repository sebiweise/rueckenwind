import type { Metadata } from 'next';
import { Hints } from '@/components/Hints';
import { JourneyView } from '@/components/JourneyView';
import { ProgressSummary } from '@/components/ProgressSummary';
import { RecentContacts } from '@/components/RecentContacts';
import { APP_NAME } from '@/lib/config';
import { loadStages } from '@/lib/content';
import type { StageNumber } from '@/lib/domain';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('nav.home')} – ${APP_NAME}` };

export default function JourneyPage() {
	const pages = loadStages();
	const stages = pages.map((page) => ({
		stage: page.stage as StageNumber,
		title: page.title,
		summary: page.summary
	}));
	const steps = pages.flatMap((page) => page.steps);

	return (
		<div className="home">
			<div className="home-main">
				<header className="page-head">
					<h1>{t('nav.home')}</h1>
					<p className="muted">{t('home.tagline')}</p>
				</header>
				<Hints />
				<JourneyView stages={stages} steps={steps} />
			</div>
			<div className="home-side">
				<ProgressSummary />
				<RecentContacts />
			</div>
		</div>
	);
}
