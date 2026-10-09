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

/** Done and all steps of one stage, for "1 von 3 Aufgaben". */
export function stageStepCount(
	steps: readonly StageStep[],
	completed: readonly string[],
	stage: StageNumber
): { done: number; total: number } {
	const inStage = steps.filter((step) => step.stage === stage);
	return {
		done: inStage.filter((step) => completed.includes(step.id)).length,
		total: inStage.length
	};
}

/** How many stages have all their steps done. */
export function stagesDone(steps: readonly StageStep[], completed: readonly string[]): number {
	return STAGES.filter((stage) => stageCompletion(steps, completed, stage) === 1).length;
}

/** What "Dein Weg" shows on top: the next task, a finished stage, or the end of all tasks. */
export type TodayState<T extends StageStep> =
	{ kind: 'task'; step: T } | { kind: 'stageDone'; next: StageNumber } | { kind: 'allDone' };

/**
 * The next task of the current stage. When the stage has none left, the next stage with
 * open steps (later ones first, then earlier ones). The stage is never changed here:
 * moving on is the person's own step.
 */
export function todayState<T extends StageStep>(
	steps: readonly T[],
	completed: readonly string[],
	current: StageNumber
): TodayState<T> {
	const step = nextStep(steps, completed, current);
	if (step) return { kind: 'task', step };
	const order = [...STAGES.filter((s) => s > current), ...STAGES.filter((s) => s < current)];
	const next = order.find((stage) => nextStep(steps, completed, stage));
	return next ? { kind: 'stageDone', next } : { kind: 'allDone' };
}
