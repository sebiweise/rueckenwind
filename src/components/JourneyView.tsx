'use client';

import Link from 'next/link';
import { getDb } from '@/lib/data/db';
import { useJourney } from '@/lib/data/hooks';
import { setStepDone, updateJourney } from '@/lib/data/repository';
import { nextStep, suggestedStage, type StageNumber } from '@/lib/domain';
import type { ContentStep } from '@/lib/content/schema';
import { t } from '@/lib/i18n';

export interface StageSummary {
	stage: StageNumber;
	title: string;
	summary: string;
}

interface Props {
	stages: StageSummary[];
	steps: ContentStep[];
}

/** "Dein Weg": the five stages, the current one highlighted with exactly one next task. */
export function JourneyView({ stages, steps }: Props) {
	const journey = useJourney();
	const current = journey?.currentStage ?? 1;
	const completed = journey?.completedSteps ?? [];
	const task = nextStep(steps, completed, current);

	async function done(stepId: string) {
		const db = getDb();
		const next = await setStepDone(db, stepId, true);
		const stage = suggestedStage(steps, next.completedSteps, next.currentStage);
		if (stage !== next.currentStage) await updateJourney(db, { currentStage: stage });
	}

	return (
		<section aria-labelledby="journey-title">
			<h2 id="journey-title">{t('journey.title')}</h2>
			<ol className="timeline">
				{stages.map((stage) => {
					const isCurrent = stage.stage === current;
					return (
						<li
							key={stage.stage}
							className={isCurrent ? 'timeline-item timeline-current' : 'timeline-item'}
							aria-current={isCurrent ? 'step' : undefined}
						>
							<span className="timeline-number" aria-hidden="true">
								{stage.stage}
							</span>
							<div className="timeline-body">
								<Link href={`/etappe/${stage.stage}/`} className="timeline-title">
									{stage.title}
								</Link>
								{isCurrent && journey && (
									<div className="card next-task">
										<p className="eyebrow">{t('journey.current')}</p>
										{task ? (
											<>
												<p className="muted">{t('journey.nextTask')}</p>
												<p className="next-task-title">{task.title}</p>
												<button
													type="button"
													className="button button-primary"
													onClick={() => done(task.id)}
												>
													{t('journey.done')}
												</button>
											</>
										) : (
											<p>{t('journey.stageDone')}</p>
										)}
									</div>
								)}
							</div>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
