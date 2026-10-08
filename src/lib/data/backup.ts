import { z } from 'zod';
import {
	CONTACT_CHANNELS,
	CONTACT_RESULTS,
	PRACTICE_KINDS,
	STAGES,
	type ContactAttempt,
	type JourneyState,
	type Practice
} from '@/lib/domain';
import { SCHEMA_VERSION, type RueckenwindDb } from './db';
import { clearAll, getJourney } from './repository';

// The CSP forbids eval; without this, zod probes `new Function` and causes a CSP violation report.
z.config({ jitless: true });

export const EXPORT_APP_ID = 'rueckenwind';

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'invalid date');
const text = z.string().max(10_000);

const practiceSchema = z.object({
	id: z.string().min(1),
	name: text,
	phone: text.optional(),
	phoneHours: text.optional(),
	address: text.optional(),
	kind: z.enum(PRACTICE_KINDS),
	notes: text.optional(),
	createdAt: isoDate
}) satisfies z.ZodType<Practice>;

const attemptSchema = z.object({
	id: z.string().min(1),
	practiceId: z.string().min(1),
	at: isoDate,
	channel: z.enum(CONTACT_CHANNELS),
	result: z.enum(CONTACT_RESULTS),
	waitTimeWeeks: z.number().nonnegative().max(1000).optional(),
	rawInput: text.optional(),
	notes: text.optional()
}) satisfies z.ZodType<ContactAttempt>;

const journeySchema = z.object({
	id: z.literal('singleton'),
	currentStage: z.union(STAGES.map((stage) => z.literal(stage))),
	completedSteps: z.array(z.string()),
	displayName: text.optional(),
	schemaVersion: z.number().int(),
	lastExportAt: isoDate.optional()
}) satisfies z.ZodType<JourneyState>;

export const exportSchema = z
	.object({
		app: z.literal(EXPORT_APP_ID),
		schemaVersion: z.number().int().min(1).max(SCHEMA_VERSION),
		exportedAt: isoDate,
		practices: z.array(practiceSchema),
		attempts: z.array(attemptSchema),
		journey: journeySchema
	})
	.refine(
		(data) => {
			const ids = new Set(data.practices.map((practice) => practice.id));
			return data.attempts.every((attempt) => ids.has(attempt.practiceId));
		},
		{ message: 'attempt without practice', path: ['attempts'] }
	);

export type ExportFile = z.infer<typeof exportSchema>;

export type ImportError = 'not_json' | 'wrong_app' | 'newer_version' | 'invalid';

export type ImportResult = { ok: true; data: ExportFile } | { ok: false; error: ImportError };

/** Reads everything from the database into the export format. */
export async function createExport(db: RueckenwindDb, now = new Date()): Promise<ExportFile> {
	const [practices, attempts, journey] = await Promise.all([
		db.practices.orderBy('createdAt').toArray(),
		db.attempts.orderBy('at').toArray(),
		getJourney(db)
	]);
	return {
		app: EXPORT_APP_ID,
		schemaVersion: SCHEMA_VERSION,
		exportedAt: now.toISOString(),
		practices,
		attempts,
		journey
	};
}

/** File name for a backup, e.g. "rueckenwind-2026-10-08.json". */
export function exportFileName(now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${EXPORT_APP_ID}-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/** Checks a backup file's text. Never throws; tells why a file cannot be used. */
export function parseImport(json: string): ImportResult {
	let raw: unknown;
	try {
		raw = JSON.parse(json);
	} catch {
		return { ok: false, error: 'not_json' };
	}
	if (typeof raw !== 'object' || raw === null || (raw as { app?: unknown }).app !== EXPORT_APP_ID) {
		return { ok: false, error: 'wrong_app' };
	}
	const version = (raw as { schemaVersion?: unknown }).schemaVersion;
	if (typeof version === 'number' && version > SCHEMA_VERSION) {
		return { ok: false, error: 'newer_version' };
	}
	const parsed = exportSchema.safeParse(raw);
	return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: 'invalid' };
}

/** True when the database already holds data that an import would replace. */
export async function hasData(db: RueckenwindDb): Promise<boolean> {
	const [practices, attempts] = await Promise.all([db.practices.count(), db.attempts.count()]);
	return practices + attempts > 0;
}

/** Replaces all local data with the backup, in one transaction. */
export async function importData(db: RueckenwindDb, data: ExportFile): Promise<void> {
	await db.transaction('rw', db.practices, db.attempts, db.journey, async () => {
		await clearAll(db);
		await db.practices.bulkAdd(data.practices);
		await db.attempts.bulkAdd(data.attempts);
		await db.journey.put({ ...data.journey, schemaVersion: SCHEMA_VERSION });
	});
}
