import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentView } from '@/components/ContentView';
import { ChevronLeftIcon } from '@/components/Icons';
import { StageDots } from '@/components/StageDots';
import { StageTasks } from '@/components/StageTasks';
import { APP_NAME } from '@/lib/config';
import { loadStage, loadStages } from '@/lib/content';
import { STAGES, type StageNumber } from '@/lib/domain';
import { t } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
	return STAGES.map((stage) => ({ stage: String(stage) }));
}

type Props = { params: Promise<{ stage: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const page = loadStage(Number((await params).stage) as StageNumber);
	return { title: `${page.title} – ${APP_NAME}`, description: page.summary };
}

export default async function StagePage({ params }: Readonly<Props>) {
	const stage = Number((await params).stage) as StageNumber;
	const stages = loadStages();
	const page = stages[stage - 1];
	const previous = stages[stage - 2];
	const next = stages[stage];
	const steps = stages.flatMap((entry) => entry.steps);

	return (
		<>
			<Link href="/app/" className="back-link">
				<ChevronLeftIcon />
				{t('nav.home')}
			</Link>
			<ContentView
				page={page}
				collapsible
				eyebrow={t('stage.label', { stage, total: STAGES.length })}
				header={<StageDots stage={stage} steps={steps} />}
			>
				<StageTasks stage={stage} steps={page.steps} />
			</ContentView>
			<nav className="pager" aria-label={t('nav.stages')}>
				{previous && (
					<Link href={`/etappe/${previous.stage}/`} rel="prev">
						<span className="pager-label">
							{t('stage.previousLabel')}
							<span className="visually-hidden">:</span>
						</span>{' '}
						<span className="pager-title">{previous.title}</span>
					</Link>
				)}
				{next && (
					<Link href={`/etappe/${next.stage}/`} rel="next">
						<span className="pager-label">
							{t('stage.nextLabel')}
							<span className="visually-hidden">:</span>
						</span>{' '}
						<span className="pager-title">{next.title}</span>
					</Link>
				)}
			</nav>
		</>
	);
}
