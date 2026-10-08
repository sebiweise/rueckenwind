import { editDistance, fold } from './text';
import type { ContactChannel, ContactResult, PracticeKind } from './types';

/** A parsed value plus how sure the parser is about it (0 = guess, 1 = certain). */
export interface ParsedField<T> {
	value: T;
	confidence: number;
}

export interface ParsedContact {
	rawInput: string;
	practiceName: ParsedField<string> | null;
	practiceKind: ParsedField<PracticeKind> | null;
	result: ParsedField<ContactResult>;
	waitTimeWeeks: ParsedField<number> | null;
	channel: ParsedField<ContactChannel>;
	/** ISO 8601. "Now" unless the text says "gestern" or "vorgestern". */
	at: ParsedField<string>;
}

interface ResultRule {
	result: ContactResult;
	pattern: RegExp;
	confidence: number;
}

/*
 * Rules run against folded text (see fold()), most specific first. Each match
 * blanks out the text it used, so "keine Warteliste" is read as a rejection
 * and the word "warteliste" cannot also count as a waiting list.
 */
const RESULT_RULES: ResultRule[] = [
	// Negations and compounds that would otherwise be misread.
	{
		result: 'not_reached',
		pattern: /\b(ab|anrufbeantworter|mailbox)( ist| war)? (voll|aus|ohne nachricht)\b/g,
		confidence: 0.95
	},
	{ result: 'not_reached', pattern: /\bkeine? nachricht( hinterlassen)?\b/g, confidence: 0.85 },
	{ result: 'not_reached', pattern: /\bkein(en)? rueckruf\b/g, confidence: 0.85 },
	{
		result: 'rejected',
		pattern: /\bwarteliste( ist| sei| war)? (geschlossen|voll|zu|dicht|gesperrt)\b/g,
		confidence: 0.95
	},
	{
		result: 'rejected',
		pattern: /\bkeine?n? (freie[nr]? )?(warteliste|termine?|plaetze|platz|therapieplaetze?)\b/g,
		confidence: 0.95
	},
	{
		result: 'rejected',
		pattern: /\bkeine? (freien? )?kapazitaet(en)?\b/g,
		confidence: 0.95
	},
	{
		result: 'rejected',
		pattern: /\b(nimmt|nehmen) (niemanden|keinen?)( neuen?)?( patient(inn)?en)?\b/g,
		confidence: 0.95
	},
	{
		result: 'rejected',
		pattern: /\bkeine (neuen? )?patient(inn)?en\b/g,
		confidence: 0.95
	},

	// Appointment.
	{
		result: 'appointment',
		pattern:
			/\btermine? (am|um|bekommen|erhalten|vereinbart|ausgemacht|gemacht|gekriegt|fuer|ab|zum|zur)\b/g,
		confidence: 0.95
	},
	{
		result: 'appointment',
		pattern:
			/\b(erstgespraech|sprechstundentermin|probatori(k|sche)|zusage|zugesagt|platz bekommen|therapieplatz( bekommen| erhalten)?)\b/g,
		confidence: 0.9
	},
	{ result: 'appointment', pattern: /\btermine?\b/g, confidence: 0.75 },

	// Waiting list.
	{
		result: 'waitlist',
		pattern: /\b(warteliste|auf (die )?liste|vorgemerkt|wartelistenplatz)\b/g,
		confidence: 0.95
	},
	{ result: 'waitlist', pattern: /\bwartezeit\b/g, confidence: 0.8 },

	// Callback promised.
	{
		result: 'callback_pending',
		pattern: /\b(rueckruf|zurueckrufen|ruft( \S+){0,3} zurueck|rufen( \S+){0,3} zurueck)\b/g,
		confidence: 0.9
	},
	{
		result: 'callback_pending',
		pattern: /\b(meldet sich|melden sich|melde mich|soll( \S+){0,2} melden)\b/g,
		confidence: 0.9
	},

	// Rejection.
	{
		result: 'rejected',
		pattern: /\b(absage|abgesagt|abgelehnt|ausgebucht|aufnahmestopp|voll|ueberfuellt)\b/g,
		confidence: 0.95
	},
	{ result: 'rejected', pattern: /\bnein\b/g, confidence: 0.6 },

	// Voicemail.
	{
		result: 'voicemail',
		pattern:
			/\b(ab|anrufbeantworter|mailbox|band)( \S+){0,2} (draufgesprochen|aufgesprochen|besprochen|gesprochen|hinterlassen|nachricht)\b/g,
		confidence: 0.95
	},
	{
		result: 'voicemail',
		pattern: /\b(nachricht hinterlassen|aufs band|auf band|draufgesprochen|aufgesprochen)\b/g,
		confidence: 0.9
	},
	{ result: 'voicemail', pattern: /\b(ab|anrufbeantworter|mailbox)\b/g, confidence: 0.75 },

	// Not reached.
	{
		result: 'not_reached',
		pattern:
			/\b(nicht erreicht|nicht erreichbar|nicht (durch)?gekommen|kein durchkommen|besetzt|erfolglos)\b/g,
		confidence: 0.9
	},
	{
		result: 'not_reached',
		pattern: /\b(niemand|keiner)( \S+)? (erreicht|dran|ran|abgenommen)\b/g,
		confidence: 0.9
	},
	{
		result: 'not_reached',
		pattern: /\bnicht (abgenommen|rangegangen|ran)\b/g,
		confidence: 0.9
	}
];

/** When two results tie on confidence, the more specific outcome wins. */
const RESULT_PRIORITY: ContactResult[] = [
	'appointment',
	'waitlist',
	'callback_pending',
	'rejected',
	'voicemail',
	'not_reached',
	'other'
];

/** Words the parser knows; misspelt input words within one edit are corrected to these. */
const KEYWORDS = [
	'rueckruf',
	'zurueckrufen',
	'zurueck',
	'warteliste',
	'wartezeit',
	'absage',
	'abgesagt',
	'abgelehnt',
	'anrufbeantworter',
	'mailbox',
	'erreicht',
	'erreichbar',
	'termin',
	'kapazitaet',
	'kapazitaeten',
	'besetzt',
	'ausgebucht',
	'aufnahmestopp',
	'vorgemerkt',
	'nachricht',
	'hinterlassen',
	'geschlossen',
	'erstgespraech',
	'sprechstunde',
	'probatorik',
	'therapieplatz',
	'patienten',
	'monate',
	'monaten',
	'wochen',
	'praxis',
	'persoenlich'
];

const NUMBER_WORDS: Record<string, number> = {
	ein: 1,
	eine: 1,
	einen: 1,
	einem: 1,
	einer: 1,
	zwei: 2,
	drei: 3,
	vier: 4,
	fuenf: 5,
	sechs: 6,
	sieben: 7,
	acht: 8,
	neun: 9,
	zehn: 10,
	elf: 11,
	zwoelf: 12,
	anderthalb: 1.5,
	eineinhalb: 1.5,
	zweieinhalb: 2.5,
	halbes: 0.5,
	halben: 0.5,
	paar: 2
};

const WEEKS_PER_UNIT = { day: 1 / 7, week: 1, month: 52 / 12, year: 52 };

const NUMBER = String.raw`\d+(?:[.,]\d+)?|\d+\/\d+|${Object.keys(NUMBER_WORDS).join('|')}`;
const UNIT = String.raw`tagen?|tage|tg|t|wochen?|wo|wk|w|monaten?|monate|monat|mon|mo|mte|m|jahren?|jahre|jahr|j`;
const DURATION = new RegExp(
	String.raw`(?:^|[^\p{L}\d])(${NUMBER})(?:\s*(?:-|bis)\s*(${NUMBER}))?\s*(${UNIT})(?![\p{L}])`,
	'gu'
);

/** Tokens that end a practice name ("Praxis Weber AB" → "Praxis Weber"). */
const NAME_STOP_WORDS = new Set([
	'ab',
	'anrufbeantworter',
	'mailbox',
	'absage',
	'abgesagt',
	'abgelehnt',
	'warteliste',
	'wartezeit',
	'rueckruf',
	'ruft',
	'rufen',
	'meldet',
	'melden',
	'termin',
	'termine',
	'nicht',
	'kein',
	'keine',
	'keinen',
	'niemand',
	'keiner',
	'erreicht',
	'besetzt',
	'voll',
	'ausgebucht',
	'nein',
	'ca',
	'ca.',
	'etwa',
	'ungefaehr',
	'circa',
	'heute',
	'gestern',
	'vorgestern',
	'morgen',
	'angerufen',
	'anruf',
	'tel',
	'tel.',
	'telefon',
	'telefonisch',
	'per',
	'mail',
	'email',
	'e-mail',
	'online',
	'persoenlich',
	'auf',
	'hat',
	'sagt',
	'sagte',
	'leider',
	'aber',
	'und',
	'erstgespraech',
	'vorgemerkt',
	'aufnahmestopp',
	'kapazitaet',
	'mo',
	'di',
	'mi',
	'do',
	'fr',
	'sa',
	'so',
	'montag',
	'dienstag',
	'mittwoch',
	'donnerstag',
	'freitag',
	'samstag',
	'sonntag'
]);

/** Words that start a practice name. Folded, without trailing dots. */
const NAME_MARKERS = new Set([
	'praxis',
	'privatpraxis',
	'gemeinschaftspraxis',
	'dr',
	'prof',
	'frau',
	'herr',
	'dipl',
	'dipl.-psych',
	'psychotherapeutin',
	'psychotherapeut',
	'therapeutin',
	'therapeut',
	'institut',
	'ambulanz',
	'hochschulambulanz',
	'mvz',
	'zentrum',
	'tss',
	'terminservicestelle'
]);

const TSS = /\b(tss|terminservicestelle|116 ?117|116117\.de)\b/;

/** Short words are too close to others for edit distance, so they get a fixed list. */
const SHORT_TYPOS: Record<string, string> = { nich: 'nicht', nciht: 'nicht', kien: 'kein' };

function correctTypos(folded: string): string {
	return folded
		.replaceAll(/\p{L}+/gu, (word) => SHORT_TYPOS[word] ?? word)
		.replaceAll(/\p{L}{5,}/gu, (word) => {
			if (KEYWORDS.includes(word)) return word;
			for (const keyword of KEYWORDS) {
				if (Math.abs(keyword.length - word.length) > 1) continue;
				if (editDistance(word, keyword) <= 1) return keyword;
			}
			return word;
		});
}

function parseNumber(token: string): number {
	if (token in NUMBER_WORDS) return NUMBER_WORDS[token];
	if (token.includes('/')) {
		const [a, b] = token.split('/').map(Number);
		return b ? a / b : Number.NaN;
	}
	return Number(token.replaceAll(',', '.'));
}

function unitToWeeks(unit: string): number {
	if (unit.startsWith('t')) return WEEKS_PER_UNIT.day;
	if (unit.startsWith('w')) return WEEKS_PER_UNIT.week;
	if (unit.startsWith('m')) return WEEKS_PER_UNIT.month;
	return WEEKS_PER_UNIT.year;
}

function parseResult(text: string): ParsedField<ContactResult> {
	let remaining = text;
	const hits: { result: ContactResult; confidence: number }[] = [];
	for (const rule of RESULT_RULES) {
		remaining = remaining.replace(rule.pattern, (match) => {
			hits.push({ result: rule.result, confidence: rule.confidence });
			return ' '.repeat(match.length);
		});
	}
	if (hits.length === 0) return { value: 'other', confidence: 0 };

	hits.sort(
		(a, b) =>
			b.confidence - a.confidence ||
			RESULT_PRIORITY.indexOf(a.result) - RESULT_PRIORITY.indexOf(b.result)
	);
	const best = hits[0];
	const ambiguous = hits.some((hit) => hit.result !== best.result);
	return { value: best.result, confidence: ambiguous ? best.confidence - 0.15 : best.confidence };
}

function durationConfidence(vague: boolean, amount: string): number {
	if (vague) return 0.6;
	return amount in NUMBER_WORDS ? 0.85 : 0.9;
}

function parseWaitTime(text: string): ParsedField<number> | null {
	let best: ParsedField<number> | null = null;
	for (const match of text.matchAll(DURATION)) {
		const [, from, to, unit] = match;
		// A lone letter as unit ("8 m") or a vague amount ("ein paar") is a weaker signal.
		const vague = unit.length === 1 || from === 'paar';
		// For a range ("2-3 Monate") the upper end counts.
		const amount = parseNumber(to ?? from);
		if (!Number.isFinite(amount) || amount <= 0) continue;
		const weeks = Math.round(amount * unitToWeeks(unit));
		if (weeks <= 0 || weeks > 520) continue;
		const field = { value: weeks, confidence: durationConfidence(vague, from) };
		if (!best || field.value > best.value) best = field;
	}
	return best;
}

function parseChannel(text: string): ParsedField<ContactChannel> {
	if (/\b(e-?mail|mail|geschrieben|angeschrieben)\b/.test(text) && !/\bmailbox\b/.test(text)) {
		return { value: 'email', confidence: 0.85 };
	}
	if (/\b(online|formular|website|webseite|portal|116117\.de)\b/.test(text)) {
		return { value: 'online', confidence: 0.85 };
	}
	if (/\b(persoenlich|vor ort|vorbeigegangen|vorbei gegangen|hingegangen)\b/.test(text)) {
		return { value: 'in_person', confidence: 0.85 };
	}
	if (/\b(angerufen|anruf|telefon\S*|tel\.?|ab|anrufbeantworter|mailbox|besetzt)\b/.test(text)) {
		return { value: 'phone', confidence: 0.9 };
	}
	return { value: 'phone', confidence: 0.5 };
}

function parsePracticeKind(text: string): ParsedField<PracticeKind> | null {
	if (TSS.test(text)) return { value: 'tss', confidence: 0.95 };
	if (/\b(institut|ausbildungsinstitut|ambulanz|hochschulambulanz)\b/.test(text)) {
		return { value: 'institut', confidence: 0.85 };
	}
	if (/\b(privatpraxis|privat|selbstzahler)\b/.test(text)) {
		return { value: 'privatpraxis', confidence: 0.8 };
	}
	if (/\b(kassenpraxis|kassensitz|kasse)\b/.test(text)) {
		return { value: 'kassenpraxis', confidence: 0.8 };
	}
	return null;
}

/** Cuts any of `chars` off the end; a loop instead of a regex keeps it linear. */
function trimEndChars(text: string, chars: string): string {
	let end = text.length;
	while (end > 0 && chars.includes(text[end - 1])) end--;
	return text.slice(0, end);
}

function foldToken(token: string): string {
	return trimEndChars(fold(token), '.:!?()"\'');
}

function isStopToken(token: string): boolean {
	const folded = correctTypos(foldToken(token));
	return (
		folded === '' ||
		NAME_STOP_WORDS.has(folded) ||
		/^\d/.test(folded) ||
		/^[~≈>]/.test(folded) ||
		folded in NUMBER_WORDS ||
		new RegExp(`^(${UNIT})$`).test(folded)
	);
}

function tidyName(tokens: string[]): string {
	const name = trimEndChars(tokens.join(' '), ' \t\n\r.:,;-');
	if (name !== name.toLowerCase()) return name;
	// All lower case: give it capitals so it reads like a name.
	return name.replaceAll(
		/(^|[\s-])(\p{L})/gu,
		(_, gap: string, letter: string) => gap + letter.toUpperCase()
	);
}

/** Tokens from the start up to the first one that is no longer part of a name. */
function takeNameTokens(tokens: string[]): string[] {
	const stop = tokens.findIndex(isStopToken);
	return stop === -1 ? tokens : tokens.slice(0, stop);
}

/** A marker word ("Praxis", "Dr.", "Frau", …) starts the name, if the segment has one. */
function nameFromMarker(segment: string): ParsedField<string> | null {
	const tokens = segment.split(/\s+/);
	const start = tokens.findIndex((token) => NAME_MARKERS.has(foldToken(token)));
	if (start === -1) return null;
	const nameTokens = [tokens[start], ...takeNameTokens(tokens.slice(start + 1))];
	const folded = foldToken(nameTokens.join(' '));
	if (TSS.test(folded) && nameTokens.length === 1) {
		return { value: 'Terminservicestelle', confidence: 0.9 };
	}
	return { value: tidyName(nameTokens), confidence: nameTokens.length > 1 ? 0.9 : 0.5 };
}

function parsePracticeName(raw: string): ParsedField<string> | null {
	const prepared = raw.replaceAll(/\b(Dr|Prof|dr|prof)\.(?=\S)/g, '$1. ');
	const segments = prepared
		.split(/[,;\n|]|\s[-–—]\s|\s\/\s/)
		.map((segment) => segment.trim())
		.filter(Boolean);
	if (segments.length === 0) return null;

	// 1. A marker word anywhere starts the name.
	for (const segment of segments) {
		const marked = nameFromMarker(segment);
		if (marked) return marked;
	}

	// 2. Otherwise the leading words of the first segment, up to the first keyword.
	if (TSS.test(fold(raw))) return { value: 'Terminservicestelle', confidence: 0.9 };
	const tokens = segments[0].split(/\s+/);
	const nameTokens = takeNameTokens(tokens);
	if (nameTokens.length === 0) return null;
	const wholeSegment = nameTokens.length === tokens.length && segments.length > 1;
	return { value: tidyName(nameTokens), confidence: wholeSegment ? 0.75 : 0.5 };
}

function parseDate(text: string, now: Date): ParsedField<string> {
	const date = new Date(now);
	if (/\bvorgestern\b/.test(text)) {
		date.setDate(date.getDate() - 2);
		return { value: date.toISOString(), confidence: 0.8 };
	}
	if (/\bgestern\b/.test(text)) {
		date.setDate(date.getDate() - 1);
		return { value: date.toISOString(), confidence: 0.8 };
	}
	return { value: date.toISOString(), confidence: 0.6 };
}

/**
 * Turns one line of free text about a contact attempt into structured fields,
 * e.g. "Praxis Weber, AB, Warteliste 8 Monate". Runs locally with plain rules,
 * never throws, and marks every field with a confidence so the UI can ask
 * for a correction where the parser is unsure.
 */
export function parseContactInput(input: string, now: Date = new Date()): ParsedContact {
	const rawInput = input.trim();
	const text = correctTypos(fold(rawInput));
	const result = parseResult(text);
	let waitTimeWeeks = parseWaitTime(text);
	// "Rückruf in 3 Tagen" is about the callback, not about a waiting time.
	if (
		waitTimeWeeks &&
		['callback_pending', 'voicemail', 'not_reached'].includes(result.value) &&
		!/\bwarte/.test(text)
	) {
		waitTimeWeeks = null;
	}
	return {
		rawInput,
		practiceName: parsePracticeName(rawInput),
		practiceKind: parsePracticeKind(text),
		result,
		waitTimeWeeks,
		channel: parseChannel(text),
		at: parseDate(text, now)
	};
}
