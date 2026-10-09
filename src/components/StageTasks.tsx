'use client';

import { PhoneIcon } from '@/components/Icons';
import { openCapture } from '@/lib/capture';
import { getDb } from '@/lib/data/db';
import { useJourney } from '@/lib/data/hooks';
import { setStepDone, updateJourney } from '@/lib/data/repository';
import type { StageNumber } from '@/lib/domain';
import type { ContentStep } from '@/lib/content/schema';
import { t } from '@/lib/i18n';

/** The small tasks of one stage as round checkboxes, plus "Hier stehe ich gerade". */
export function StageTasks({
	stage,
	steps
}: Readonly<{ stage: StageNumber; steps: ContentStep[] }>) {
	const journey = useJourney();
	const completed = journey?.completedSteps ?? [];
	const done = steps.filter((step) => completed.includes(step.id)).length;

	return (
		<section className="stage-tasks" aria-labelledby="tasks-title" aria-busy={!journey}>
			<div className="section-head">
				<h2 id="tasks-title">{t('stage.tasks')}</h2>
				<p className="muted">{t('stage.tasksCount', { done, total: steps.length })}</p>
			</div>
			<ul className="checks">
				{steps.map((step) => {
					const checked = completed.includes(step.id);
					const id = `task-${step.id}`;
					return (
						<li key={step.id} className={checked ? 'check check-done' : 'check'}>
							<input
								id={id}
								type="checkbox"
								className="check-box"
								checked={checked}
								disabled={!journey}
								onChange={(event) => setStepDone(getDb(), step.id, event.target.checked)}
							/>
							<label htmlFor={id}>{step.title}</label>
							{step.action === 'capture' && !checked && (
								<button type="button" className="button button-small" onClick={() => openCapture()}>
									<PhoneIcon />
									{t('journey.capture')}
								</button>
							)}
						</li>
					);
				})}
			</ul>
			{journey && (
				<p className="muted set-current">
					{journey.currentStage === stage ? (
						t('journey.isCurrent')
					) : (
						<>
							{t('journey.notHere')}{' '}
							<button
								type="button"
								className="button button-quiet"
								onClick={() => updateJourney(getDb(), { currentStage: stage })}
							>
								{t('journey.setCurrent')}
							</button>
						</>
					)}
				</p>
			)}
		</section>
	);
}
