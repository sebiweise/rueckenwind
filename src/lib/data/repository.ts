import type {
	ContactAttempt,
	ContactChannel,
	ContactResult,
	JourneyState,
	Practice,
	PracticeKind
} from '@/lib/domain';
import { fold } from '@/lib/domain';
import { SCHEMA_VERSION, type RueckenwindDb } from './db';

export function newId(): string {
	return crypto.randomUUID();
}

export function defaultJourney(): JourneyState {
	return { id: 'singleton', currentStage: 1, completedSteps: [], schemaVersion: SCHEMA_VERSION };
}

// Practices

export type PracticeInput = Omit<Practice, 'id' | 'createdAt' | 'kind'> &
	Partial<Pick<Practice, 'kind' | 'createdAt'>>;

export async function createPractice(db: RueckenwindDb, input: PracticeInput): Promise<Practice> {
	const practice: Practice = {
		kind: 'kassenpraxis',
		createdAt: new Date().toISOString(),
		...input,
		name: input.name.trim(),
		id: newId()
	};
	await db.practices.add(practice);
	return practice;
}

export async function updatePractice(
	db: RueckenwindDb,
	id: string,
	changes: Partial<Omit<Practice, 'id'>>
): Promise<void> {
	await db.practices.update(id, changes);
}

/** Deletes a practice together with all its contact attempts. */
export async function deletePractice(db: RueckenwindDb, id: string): Promise<void> {
	await db.transaction('rw', db.practices, db.attempts, async () => {
		await db.attempts.where('practiceId').equals(id).delete();
		await db.practices.delete(id);
	});
}

export function getPractice(db: RueckenwindDb, id: string): Promise<Practice | undefined> {
	return db.practices.get(id);
}

/** All practices, sorted by name. */
export async function listPractices(db: RueckenwindDb): Promise<Practice[]> {
	const practices = await db.practices.toArray();
	return practices.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** Finds a practice by name, ignoring case, umlaut spelling and extra spaces. */
export async function findPracticeByName(
	db: RueckenwindDb,
	name: string
): Promise<Practice | undefined> {
	const wanted = fold(name);
	if (!wanted) return undefined;
	return db.practices.filter((practice) => fold(practice.name) === wanted).first();
}

// Contact attempts

export type AttemptInput = Omit<ContactAttempt, 'id'>;

export async function addAttempt(db: RueckenwindDb, input: AttemptInput): Promise<ContactAttempt> {
	const attempt: ContactAttempt = { ...input, id: newId() };
	await db.attempts.add(attempt);
	return attempt;
}

export async function updateAttempt(
	db: RueckenwindDb,
	id: string,
	changes: Partial<Omit<ContactAttempt, 'id'>>
): Promise<void> {
	await db.attempts.update(id, changes);
}

export async function deleteAttempt(db: RueckenwindDb, id: string): Promise<void> {
	await db.attempts.delete(id);
}

/** All attempts, newest first; optionally only those of one practice. */
export async function listAttempts(
	db: RueckenwindDb,
	practiceId?: string
): Promise<ContactAttempt[]> {
	const collection = practiceId
		? db.attempts.where('practiceId').equals(practiceId)
		: db.attempts.toCollection();
	const attempts = await collection.toArray();
	return attempts.sort((a, b) => b.at.localeCompare(a.at));
}

export interface ContactRecord {
	practiceName: string;
	practiceKind?: PracticeKind;
	result: ContactResult;
	at?: string;
	channel?: ContactChannel;
	waitTimeWeeks?: number;
	rawInput?: string;
	notes?: string;
}

/**
 * Saves a contact attempt from the quick entry: reuses a practice with the
 * same name or creates it, then adds the attempt.
 */
export async function recordContact(
	db: RueckenwindDb,
	record: ContactRecord
): Promise<{ practice: Practice; attempt: ContactAttempt }> {
	return db.transaction('rw', db.practices, db.attempts, async () => {
		const name = record.practiceName.trim();
		const practice =
			(await findPracticeByName(db, name)) ??
			(await createPractice(db, { name, kind: record.practiceKind ?? 'kassenpraxis' }));
		const attempt = await addAttempt(db, {
			practiceId: practice.id,
			at: record.at ?? new Date().toISOString(),
			channel: record.channel ?? 'phone',
			result: record.result,
			...(record.waitTimeWeeks !== undefined && { waitTimeWeeks: record.waitTimeWeeks }),
			...(record.rawInput && { rawInput: record.rawInput }),
			...(record.notes && { notes: record.notes })
		});
		return { practice, attempt };
	});
}

// Journey

export async function getJourney(db: RueckenwindDb): Promise<JourneyState> {
	return (await db.journey.get('singleton')) ?? defaultJourney();
}

export async function updateJourney(
	db: RueckenwindDb,
	changes: Partial<Omit<JourneyState, 'id' | 'schemaVersion'>>
): Promise<JourneyState> {
	return db.transaction('rw', db.journey, async () => {
		const next = { ...(await getJourney(db)), ...changes };
		await db.journey.put(next);
		return next;
	});
}

/** Marks a step as done or not done. */
export async function setStepDone(
	db: RueckenwindDb,
	stepId: string,
	done: boolean
): Promise<JourneyState> {
	const journey = await getJourney(db);
	const steps = journey.completedSteps.filter((id) => id !== stepId);
	return updateJourney(db, { completedSteps: done ? [...steps, stepId] : steps });
}

/** Deletes everything this app stored on the device. */
export async function clearAll(db: RueckenwindDb): Promise<void> {
	await db.transaction('rw', db.practices, db.attempts, db.journey, async () => {
		await Promise.all([db.practices.clear(), db.attempts.clear(), db.journey.clear()]);
	});
}
