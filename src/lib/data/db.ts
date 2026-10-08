import Dexie, { type DexieOptions, type EntityTable } from 'dexie';
import type { ContactAttempt, JourneyState, Practice } from '@/lib/domain';

export const DB_NAME = 'rueckenwind';

/** Bump together with a new `version()` block below; old versions stay for migrations. */
export const SCHEMA_VERSION = 1;

export type RueckenwindDb = Dexie & {
	practices: EntityTable<Practice, 'id'>;
	attempts: EntityTable<ContactAttempt, 'id'>;
	journey: EntityTable<JourneyState, 'id'>;
};

/**
 * Opens the local IndexedDB database. Everything stays in this browser;
 * nothing is ever sent anywhere.
 */
export function createDb(name = DB_NAME, options?: DexieOptions): RueckenwindDb {
	const db = new Dexie(name, options) as RueckenwindDb;
	// Only indexed fields are listed; every other field is stored as well.
	db.version(1).stores({
		practices: 'id, name, kind, createdAt',
		attempts: 'id, practiceId, at, result',
		journey: 'id'
	});
	return db;
}

let shared: RueckenwindDb | null = null;

/** The app-wide database, opened on first use (never during server rendering). */
export function getDb(): RueckenwindDb {
	if (typeof indexedDB === 'undefined') {
		throw new TypeError('IndexedDB is not available here.');
	}
	shared ??= createDb();
	return shared;
}
