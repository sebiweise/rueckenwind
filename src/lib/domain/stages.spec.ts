import { describe, expect, it } from 'vitest';
import {
	isStage,
	nextStep,
	stageCompletion,
	stagesDone,
	stageStepCount,
	suggestedStage,
	todayState,
	type StageStep
} from './stages';

const STEPS: StageStep[] = [
	{ id: 'orientierung-lesen', stage: 1 },
	{ id: 'sprechstunde-buchen', stage: 2 },
	{ id: 'ptv11-aufbewahren', stage: 2 },
	{ id: 'praxen-anrufen', stage: 3 },
	{ id: 'antrag-stellen', stage: 5 }
];

describe('isStage', () => {
	it('accepts 1 to 5 only', () => {
		expect([1, 2, 3, 4, 5].every(isStage)).toBe(true);
		expect([0, 6, '1', null, 2.5].some(isStage)).toBe(false);
	});
});

describe('nextStep', () => {
	it('returns the first open step of the stage', () => {
		expect(nextStep(STEPS, [], 2)?.id).toBe('sprechstunde-buchen');
		expect(nextStep(STEPS, ['sprechstunde-buchen'], 2)?.id).toBe('ptv11-aufbewahren');
	});

	it('returns null when the stage is done or has no steps', () => {
		expect(nextStep(STEPS, ['sprechstunde-buchen', 'ptv11-aufbewahren'], 2)).toBeNull();
		expect(nextStep(STEPS, [], 4)).toBeNull();
	});
});

describe('stageCompletion', () => {
	it('returns the share of done steps', () => {
		expect(stageCompletion(STEPS, [], 2)).toBe(0);
		expect(stageCompletion(STEPS, ['ptv11-aufbewahren'], 2)).toBe(0.5);
		expect(stageCompletion(STEPS, ['orientierung-lesen'], 1)).toBe(1);
		expect(stageCompletion(STEPS, [], 4)).toBe(0);
	});
});

describe('suggestedStage', () => {
	it('stays on the current stage while it has open steps', () => {
		expect(suggestedStage(STEPS, [], 2)).toBe(2);
	});

	it('moves on to the next stage with open steps', () => {
		expect(suggestedStage(STEPS, ['sprechstunde-buchen', 'ptv11-aufbewahren'], 2)).toBe(3);
		expect(suggestedStage(STEPS, ['praxen-anrufen'], 3)).toBe(5);
	});

	it('keeps the current stage when everything ahead is done', () => {
		expect(suggestedStage(STEPS, ['antrag-stellen'], 5)).toBe(5);
	});
});

describe('stageStepCount', () => {
	it('counts done and all steps of a stage', () => {
		expect(stageStepCount(STEPS, [], 2)).toEqual({ done: 0, total: 2 });
		expect(stageStepCount(STEPS, ['ptv11-aufbewahren'], 2)).toEqual({ done: 1, total: 2 });
		expect(stageStepCount(STEPS, ['praxen-anrufen'], 4)).toEqual({ done: 0, total: 0 });
	});
});

describe('stagesDone', () => {
	it('counts the stages whose steps are all done', () => {
		expect(stagesDone(STEPS, [])).toBe(0);
		expect(stagesDone(STEPS, ['orientierung-lesen', 'sprechstunde-buchen'])).toBe(1);
		expect(
			stagesDone(STEPS, ['orientierung-lesen', 'sprechstunde-buchen', 'ptv11-aufbewahren'])
		).toBe(2);
	});
});

describe('todayState', () => {
	it('offers the next open step of the current stage', () => {
		const state = todayState(STEPS, ['sprechstunde-buchen'], 2);
		expect(state).toEqual({ kind: 'task', step: STEPS[2] });
	});

	it('celebrates a finished stage and points to the next one with open steps', () => {
		expect(todayState(STEPS, ['orientierung-lesen'], 1)).toEqual({ kind: 'stageDone', next: 2 });
		expect(todayState(STEPS, ['praxen-anrufen'], 3)).toEqual({ kind: 'stageDone', next: 5 });
	});

	it('points back to an earlier open stage when nothing ahead is open', () => {
		expect(todayState(STEPS, ['antrag-stellen'], 5)).toEqual({ kind: 'stageDone', next: 1 });
	});

	it('treats a stage without steps like a finished one', () => {
		expect(todayState(STEPS, [], 4)).toEqual({ kind: 'stageDone', next: 5 });
	});

	it('says when every step is done', () => {
		expect(
			todayState(
				STEPS,
				STEPS.map((step) => step.id),
				5
			)
		).toEqual({ kind: 'allDone' });
	});
});
