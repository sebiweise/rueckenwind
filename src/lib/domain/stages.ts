import type { StageNumber } from './types';
import { STAGES } from './types';

/** One small task within a stage. IDs come from the content frontmatter. */
export interface StageStep {
	id: string;
	stage: StageNumber;
}

export function isStage(value: unknown): value is StageNumber {
	return STAGES.includes(value as StageNumber);
}

/** The first step of `stage` that is not done yet, or null when all are done. */
export function nextStep<T extends StageStep>(
	steps: readonly T[],
	completed: readonly string[],
	stage: StageNumber
): T | null {
	return steps.find((step) => step.stage === stage && !completed.includes(step.id)) ?? null;
}

/** Share of done steps in a stage, 0 to 1. A stage without steps counts as 0. */
export function stageCompletion(
	steps: readonly StageStep[],
	completed: readonly string[],
	stage: StageNumber
): number {
	const inStage = steps.filter((step) => step.stage === stage);
	if (inStage.length === 0) return 0;
	return inStage.filter((step) => completed.includes(step.id)).length / inStage.length;
}

/**
 * The stage to suggest next: the current one while it still has open steps,
 * otherwise the first later stage with open steps. Stages are never locked;
 * this is only a suggestion.
 */
export function suggestedStage(
	steps: readonly StageStep[],
	completed: readonly string[],
	current: StageNumber
): StageNumber {
	for (const stage of STAGES.filter((s) => s >= current)) {
		if (nextStep(steps, completed, stage)) return stage;
	}
	return current;
}
