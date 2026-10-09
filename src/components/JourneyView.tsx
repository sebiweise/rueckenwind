'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon, ChevronRightIcon, PhoneIcon, WindIcon } from '@/components/Icons';
import { openCapture } from '@/lib/capture';
import { getDb } from '@/lib/data/db';
import { useJourney } from '@/lib/data/hooks';
import { setStepDone, updateJourney } from '@/lib/data/repository';
import {
	STAGES,
	stageCompletion,
	stagesDone,
	stageStepCount,
	todayState,
	type StageNumber
} from '@/lib/domain';
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

/** "Dein Weg": today's one small task on top, the five stages as a path below. */
export function JourneyView({ stages, steps }: Readonly<Props>) {
	const journey = useJourney();
	const current = journey?.currentStage ?? 1;
	const completed = journey?.completedSteps ?? [];

	return (
		<>
			<TodayCard
				stages={stages}
				steps={steps}
				current={current}
				completed={completed}
				loaded={!!journey}
			/>
			<StagePath
				stages={stages}
				steps={steps}
				current={current}
				completed={completed}
				loaded={!!journey}
			/>
		</>
	);
}

interface StateProps extends Props {
	current: StageNumber;
	completed: string[];
	loaded: boolean;
}

function TodayCard({ stages, steps, current, completed, loaded }: Readonly<StateProps>) {
	const [pause, setPause] = useState(false);
	const state = todayState(steps, completed, current);
	const title = (stage: StageNumber) => stages[stage - 1].title;

	// Until the saved state has loaded, the card keeps its place invisibly so the
	// page below does not jump (layout shift) once it appears.
	const className = loaded ? 'today' : 'today today-pending';

	if (state.kind === 'task') {
		const { step } = state;
		const inStage = steps.filter((s) => s.stage === current);
		const position = inStage.indexOf(step) + 1;
		const markDone = () => setStepDone(getDb(), step.id, true);
		return (
			<section className={className} aria-labelledby="today-title">
				<WindIcon className="today-wind" />
				<p className="eyebrow" id="today-title">
					{t('journey.nextTask')}
				</p>
				<p className="today-task">{step.title}</p>
				<p className="tags">
					<span className="tag">
						{t('journey.stageTag', { stage: current, title: title(current) })}
					</span>
					<span className="tag">
						{t('journey.taskCount', { number: position, total: inStage.length })}
					</span>
				</p>
				<div className="actions">
					{step.action === 'capture' && (
						<button
							type="button"
							className="button button-primary"
							disabled={!loaded}
							onClick={() => openCapture()}
						>
							<PhoneIcon />
							{t('journey.capture')}
						</button>
					)}
					<button
						type="button"
						className={step.action === 'capture' ? 'button' : 'button button-primary'}
						disabled={!loaded}
						onClick={markDone}
					>
						{t('journey.done')}
					</button>
					<Link href={`/etappe/${current}/`} className="button button-quiet">
						{t('journey.howTo')}
					</Link>
				</div>
			</section>
		);
	}

	if (state.kind === 'stageDone') {
		const { next } = state;
		return (
			<section className={`${className} today-done`} aria-labelledby="today-title">
				<span className="today-badge" aria-hidden="true">
					<CheckIcon />
				</span>
				<p className="eyebrow">{t('journey.stageDoneEyebrow', { stage: current })}</p>
				<h2 id="today-title">{t('journey.stageDoneTitle', { title: title(current) })}</h2>
				<p className="muted">{pause ? t('journey.pauseText') : t('journey.stageDoneText')}</p>
				<div className="actions actions-stacked">
					<button
						type="button"
						className="button button-primary"
						onClick={() => updateJourney(getDb(), { currentStage: next })}
					>
						{t('journey.continue', { title: title(next) })}
					</button>
					{!pause && (
						<button type="button" className="button button-quiet" onClick={() => setPause(true)}>
							{t('journey.pause')}
						</button>
					)}
				</div>
			</section>
		);
	}

	return (
		<section className={`${className} today-done`} aria-labelledby="today-title">
			<span className="today-badge" aria-hidden="true">
				<CheckIcon />
			</span>
			<h2 id="today-title">{t('journey.allDoneTitle')}</h2>
			<p className="muted">{t('journey.allDoneText')}</p>
		</section>
	);
}

function StagePath({ stages, steps, current, completed, loaded }: Readonly<StateProps>) {
	const doneCount = loaded ? stagesDone(steps, completed) : 0;

	return (
		<section className="journey" aria-labelledby="journey-title">
			<div className="section-head">
				<h2 id="journey-title">{t('journey.stagesTitle')}</h2>
				<p className="muted">
					{t('journey.stagesDone', { count: doneCount, total: STAGES.length })}
				</p>
			</div>
			<div className="segments" aria-hidden="true">
				{stages.map((stage) => (
					<span
						key={stage.stage}
						style={
							{
								'--fill': `${loaded ? stageCompletion(steps, completed, stage.stage) * 100 : 0}%`
							} as React.CSSProperties
						}
					/>
				))}
			</div>
			<ol className="path">
				{stages.map((stage) => {
					const isCurrent = stage.stage === current;
					const count = stageStepCount(steps, completed, stage.stage);
					const isDone = loaded && count.total > 0 && count.done === count.total;
					const className = ['stop', isCurrent && 'stop-current', isDone && 'stop-done']
						.filter(Boolean)
						.join(' ');
					return (
						<li
							key={stage.stage}
							className={className}
							aria-current={isCurrent ? 'step' : undefined}
						>
							<Link href={`/etappe/${stage.stage}/`} className="stop-link">
								<span className="stop-node" aria-hidden="true">
									{isDone ? <CheckIcon /> : stage.stage}
								</span>
								<span className="stop-text">
									<span className="stop-title">{stage.title}</span>
									<span className="stop-state">{stopState(isCurrent, isDone, count)}</span>
								</span>
								<ChevronRightIcon className="icon stop-chevron" />
							</Link>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

function stopState(
	isCurrent: boolean,
	isDone: boolean,
	{ done, total }: { done: number; total: number }
): string {
	if (isDone) return t('journey.stateDone');
	const steps =
		done > 0
			? t('journey.stepsDone', { done, total })
			: t(total === 1 ? 'journey.stepsOne' : 'journey.steps', { count: total });
	return isCurrent ? `${t('journey.stateCurrent')} · ${steps}` : steps;
}
