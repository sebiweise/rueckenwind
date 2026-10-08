/** Outcome of a single contact attempt. */
export type ContactResult =
	| 'not_reached' // nicht erreicht / AB ohne Rückruf
	| 'voicemail' // Nachricht auf AB hinterlassen
	| 'rejected' // Absage, keine Kapazität
	| 'waitlist' // auf Warteliste gesetzt
	| 'callback_pending' // Rückruf versprochen
	| 'appointment' // Termin bekommen
	| 'other';

export const CONTACT_RESULTS: readonly ContactResult[] = [
	'not_reached',
	'voicemail',
	'rejected',
	'waitlist',
	'callback_pending',
	'appointment',
	'other'
];

export type PracticeKind = 'kassenpraxis' | 'privatpraxis' | 'institut' | 'tss' | 'other';

export const PRACTICE_KINDS: readonly PracticeKind[] = [
	'kassenpraxis',
	'privatpraxis',
	'institut',
	'tss',
	'other'
];

export type ContactChannel = 'phone' | 'email' | 'online' | 'in_person';

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
	'phone',
	'email',
	'online',
	'in_person'
];

export type StageNumber = 1 | 2 | 3 | 4 | 5;

export const STAGES: readonly StageNumber[] = [1, 2, 3, 4, 5];

export interface Practice {
	id: string; // UUID
	name: string;
	phone?: string;
	phoneHours?: string; // Freitext, z. B. "Mo/Mi 8–9 Uhr"
	address?: string;
	kind: PracticeKind;
	notes?: string;
	createdAt: string; // ISO 8601
}

export interface ContactAttempt {
	id: string;
	practiceId: string;
	at: string; // ISO 8601, editierbar
	channel: ContactChannel;
	result: ContactResult;
	waitTimeWeeks?: number; // normalisiert aus Freitext
	rawInput?: string; // Originaleingabe, für Nachvollziehbarkeit
	notes?: string;
}

export interface JourneyState {
	id: 'singleton';
	currentStage: StageNumber;
	completedSteps: string[]; // IDs aus content-Frontmatter
	displayName?: string; // nur für PDF, optional
	schemaVersion: number;
	lastExportAt?: string; // ISO 8601, für die Export-Erinnerung
}
