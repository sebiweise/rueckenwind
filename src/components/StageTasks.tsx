'use client';

import { getDb } from '@/lib/data/db';
import { useJourney } from '@/lib/data/hooks';
import { setStepDone, updateJourney } from '@/lib/data/repository';
import type { StageNumber } from '@/lib/domain';
import type { ContentStep } from '@/lib/content/schema';
import { t } from '@/lib/i18n';

/** The small tasks of one stage as checkboxes, plus "Hier stehe ich gerade". */
export function StageTasks({
	stage,
	steps
}: Readonly<{ stage: StageNumber; steps: ContentStep[] }>) {
	const journey = useJourney();
	if (!journey) return null;
	const isCurrent = journey.currentStage === stage;

	return (
		<section className="card" aria-labelledby="tasks-title">
			<h2 id="tasks-title">{t('stage.tasks')}</h2>
			<ul className="tasks">
				{steps.map((step) => (
					<li key={step.id}>
						<label className="option">
							<input
								type="checkbox"
								checked={journey.completedSteps.includes(step.id)}
								onChange={(event) => setStepDone(getDb(), step.id, event.target.checked)}
							/>
							{step.title}
						</label>
					</li>
				))}
			</ul>
			{isCurrent ? (
				<p className="muted">{t('journey.isCurrent')}</p>
			) : (
				<button
					type="button"
					className="button"
					onClick={() => updateJourney(getDb(), { currentStage: stage })}
				>
					{t('journey.setCurrent')}
				</button>
			)}
		</section>
	);
}
