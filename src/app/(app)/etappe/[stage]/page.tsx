import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentView } from '@/components/ContentView';
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

	return (
		<>
			<ContentView page={page} collapsible eyebrow={t('stage.label', { stage })} />
			<StageTasks stage={stage} steps={page.steps} />
			<nav className="pager" aria-label={t('nav.stages')}>
				{previous && (
					<Link href={`/etappe/${previous.stage}/`} rel="prev">
						{t('stage.previous', { title: previous.title })}
					</Link>
				)}
				{next && (
					<Link href={`/etappe/${next.stage}/`} rel="next">
						{t('stage.next', { title: next.title })}
					</Link>
				)}
			</nav>
		</>
	);
}
