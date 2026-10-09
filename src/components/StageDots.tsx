'use client';

import { CheckIcon } from '@/components/Icons';
import { useJourney } from '@/lib/data/hooks';
import { STAGES, stageCompletion, type StageNumber } from '@/lib/domain';
import type { ContentStep } from '@/lib/content/schema';

/** Five small dots above a stage: done ones filled, this one ringed. Decorative. */
export function StageDots({
	stage,
	steps
}: Readonly<{ stage: StageNumber; steps: ContentStep[] }>) {
	const journey = useJourney();
	const completed = journey?.completedSteps ?? [];

	return (
		<div className="stage-dots" aria-hidden="true">
			{STAGES.map((number) => {
				const done = !!journey && stageCompletion(steps, completed, number) === 1;
				const className = [
					'stage-dot',
					done && 'stage-dot-done',
					number === stage && 'stage-dot-here'
				]
					.filter(Boolean)
					.join(' ');
				return (
					<span key={number} className={className}>
						{done ? <CheckIcon /> : number}
					</span>
				);
			})}
		</div>
	);
}
