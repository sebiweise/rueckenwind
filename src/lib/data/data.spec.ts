import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type RueckenwindDb } from './db';
import {
	addAttempt,
	clearAll,
	createPractice,
	deleteAttempt,
	deletePractice,
	findPracticeByName,
	getJourney,
	getPractice,
	listAttempts,
	listPractices,
	recordContact,
	setStepDone,
	updateAttempt,
	updateJourney,
	updatePractice
} from './repository';
import {
	createExport,
	exportFileName,
	hasData,
	importData,
	parseImport,
	type ExportFile
} from './backup';

let db: RueckenwindDb;

beforeEach(() => {
	db = createDb('test', { indexedDB: new IDBFactory(), IDBKeyRange });
});

afterEach(async () => {
	db.close();
});

async function seed() {
	const weber = await createPractice(db, {
		name: 'Praxis Weber',
		phone: '030 123456',
		phoneHours: 'Mo/Mi 8–9 Uhr'
	});
	const tss = await createPractice(db, { name: 'Terminservicestelle', kind: 'tss' });
	await addAttempt(db, {
		practiceId: weber.id,
		at: '2026-10-01T08:15:00.000Z',
		channel: 'phone',
		result: 'waitlist',
		waitTimeWeeks: 35,
		rawInput: 'Praxis Weber, AB, Warteliste 8 Monate'
	});
	await addAttempt(db, {
		practiceId: tss.id,
		at: '2026-10-02T10:00:00.000Z',
		channel: 'phone',
		result: 'appointment',
		notes: 'Sprechstunde am 14.10.'
	});
	await updateJourney(db, {
		currentStage: 3,
		completedSteps: ['sprechstunde'],
		displayName: 'Kim Ä. Öztürk'
	});
	return { weber, tss };
}

describe('practices', () => {
	it('creates practices as Kassenpraxis by default and lists them by name', async () => {
		await createPractice(db, { name: '  Zeller ' });
		await createPractice(db, { name: 'Ärztehaus Mitte', kind: 'institut' });
		const practices = await listPractices(db);
		expect(practices.map((p) => p.name)).toEqual(['Ärztehaus Mitte', 'Zeller']);
		expect(practices[1].kind).toBe('kassenpraxis');
		expect(practices[0].kind).toBe('institut');
		expect(practices[0].id).toMatch(/^[0-9a-f-]{36}$/);
	});

	it('updates a practice', async () => {
		const practice = await createPractice(db, { name: 'Weber' });
		await updatePractice(db, practice.id, { phoneHours: 'Di 12–13 Uhr' });
		expect((await getPractice(db, practice.id))?.phoneHours).toBe('Di 12–13 Uhr');
	});

	it('finds a practice by name regardless of case and umlaut spelling', async () => {
		const practice = await createPractice(db, { name: 'Praxis Müller' });
		expect((await findPracticeByName(db, 'praxis  mueller'))?.id).toBe(practice.id);
		expect(await findPracticeByName(db, 'Praxis Meier')).toBeUndefined();
		expect(await findPracticeByName(db, '  ')).toBeUndefined();
	});

	it('deletes a practice with its attempts', async () => {
		const { weber, tss } = await seed();
		await deletePractice(db, weber.id);
		expect(await getPractice(db, weber.id)).toBeUndefined();
		const attempts = await listAttempts(db);
		expect(attempts.map((a) => a.practiceId)).toEqual([tss.id]);
	});
});

describe('attempts', () => {
	it('lists attempts newest first, optionally per practice', async () => {
		const { weber } = await seed();
		const all = await listAttempts(db);
		expect(all.map((a) => a.at)).toEqual(['2026-10-02T10:00:00.000Z', '2026-10-01T08:15:00.000Z']);
		expect(await listAttempts(db, weber.id)).toHaveLength(1);
	});

	it('updates and deletes an attempt', async () => {
		const { weber } = await seed();
		const [attempt] = await listAttempts(db, weber.id);
		await updateAttempt(db, attempt.id, { result: 'rejected', at: '2026-10-03T09:00:00.000Z' });
		expect((await listAttempts(db, weber.id))[0].result).toBe('rejected');
		await deleteAttempt(db, attempt.id);
		expect(await listAttempts(db, weber.id)).toEqual([]);
	});

	it('records a contact and reuses an existing practice', async () => {
		const first = await recordContact(db, {
			practiceName: 'Praxis Weber',
			result: 'not_reached',
			rawInput: 'Praxis Weber nicht erreicht'
		});
		const second = await recordContact(db, {
			practiceName: 'praxis weber',
			result: 'waitlist',
			waitTimeWeeks: 26,
			at: '2026-10-05T08:00:00.000Z',
			channel: 'email',
			notes: 'per Mail'
		});
		expect(second.practice.id).toBe(first.practice.id);
		expect(first.attempt.channel).toBe('phone');
		expect(first.attempt.rawInput).toBe('Praxis Weber nicht erreicht');
		expect(second.attempt).toMatchObject({
			waitTimeWeeks: 26,
			channel: 'email',
			notes: 'per Mail'
		});
		expect(await listPractices(db)).toHaveLength(1);
		expect(await listAttempts(db)).toHaveLength(2);
	});

	it('creates a new practice with the given kind', async () => {
		const { practice } = await recordContact(db, {
			practiceName: 'Terminservicestelle',
			practiceKind: 'tss',
			result: 'appointment'
		});
		expect(practice.kind).toBe('tss');
	});
});

describe('journey', () => {
	it('starts at stage 1 with nothing done', async () => {
		expect(await getJourney(db)).toEqual({
			id: 'singleton',
			currentStage: 1,
			completedSteps: [],
			schemaVersion: 1
		});
	});

	it('stores changes and toggles steps', async () => {
		await updateJourney(db, { currentStage: 2 });
		await setStepDone(db, 'a', true);
		await setStepDone(db, 'b', true);
		await setStepDone(db, 'a', true);
		expect((await getJourney(db)).completedSteps).toEqual(['b', 'a']);
		await setStepDone(db, 'b', false);
		const journey = await getJourney(db);
		expect(journey.completedSteps).toEqual(['a']);
		expect(journey.currentStage).toBe(2);
	});
});

describe('export and import', () => {
	it('export → delete all → import gives identical data', async () => {
		await seed();
		const before = await createExport(db);
		const json = JSON.stringify(before);

		await clearAll(db);
		expect(await hasData(db)).toBe(false);
		expect(await getJourney(db)).toMatchObject({ currentStage: 1 });

		const parsed = parseImport(json);
		expect(parsed.ok).toBe(true);
		if (!parsed.ok) return;
		await importData(db, parsed.data);

		const after = await createExport(db, new Date(before.exportedAt));
		expect(after).toEqual(before);
		expect(await hasData(db)).toBe(true);
	});

	it('replaces existing data on import', async () => {
		await seed();
		const backup = await createExport(db);
		await createPractice(db, { name: 'Neu nach dem Export' });
		await importData(db, backup);
		expect((await listPractices(db)).map((p) => p.name)).not.toContain('Neu nach dem Export');
	});

	it('exports an empty database', async () => {
		const empty = await createExport(db, new Date('2026-10-08T12:00:00.000Z'));
		expect(empty).toMatchObject({
			app: 'rueckenwind',
			schemaVersion: 1,
			exportedAt: '2026-10-08T12:00:00.000Z',
			practices: [],
			attempts: []
		});
		expect(parseImport(JSON.stringify(empty)).ok).toBe(true);
	});

	it('names the file after the date', () => {
		expect(exportFileName(new Date(2026, 0, 5))).toBe('rueckenwind-2026-01-05.json');
	});

	describe('rejects unusable files', () => {
		let valid: ExportFile;
		beforeEach(async () => {
			await seed();
			valid = await createExport(db);
		});

		it.each([
			['not JSON', () => 'kein json', 'not_json'],
			['another app', () => JSON.stringify({ ...valid, app: 'andere-app' }), 'wrong_app'],
			['an array', () => '[]', 'wrong_app'],
			['null', () => 'null', 'wrong_app'],
			['a newer version', () => JSON.stringify({ ...valid, schemaVersion: 99 }), 'newer_version'],
			[
				'an unknown result',
				() =>
					JSON.stringify({ ...valid, attempts: [{ ...valid.attempts[0], result: 'vielleicht' }] }),
				'invalid'
			],
			[
				'a broken date',
				() => JSON.stringify({ ...valid, attempts: [{ ...valid.attempts[0], at: 'gestern' }] }),
				'invalid'
			],
			['an attempt without practice', () => JSON.stringify({ ...valid, practices: [] }), 'invalid'],
			[
				'a wrong stage',
				() => JSON.stringify({ ...valid, journey: { ...valid.journey, currentStage: 7 } }),
				'invalid'
			],
			['missing lists', () => JSON.stringify({ app: 'rueckenwind', schemaVersion: 1 }), 'invalid']
		])('%s', (_, file, error) => {
			expect(parseImport(file())).toEqual({ ok: false, error });
		});
	});
});
