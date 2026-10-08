import { describe, expect, it } from 'vitest';
import { parseContactInput } from './parser';
import type { ContactResult } from './types';

const NOW = new Date('2026-10-08T09:30:00');

interface Case {
	input: string;
	result: ContactResult;
	name?: string | null;
	weeks?: number | null;
}

/** Realistic one-line entries, including typos, lower case and abbreviations. */
const CASES: Case[] = [
	// From the plan
	{
		input: 'Praxis Weber, AB, Warteliste 8 Monate',
		result: 'waitlist',
		name: 'Praxis Weber',
		weeks: 35
	},
	{ input: 'Warteliste ca. 1 Jahr', result: 'waitlist', name: null, weeks: 52 },
	{ input: 'rückruf mittwoch', result: 'callback_pending', name: null, weeks: null },
	{ input: 'AB', result: 'voicemail', name: null },
	// Not reached
	{ input: 'Dr. Müller, nicht erreicht', result: 'not_reached', name: 'Dr. Müller' },
	{ input: 'praxis schmidt nicht erreicht', result: 'not_reached', name: 'Praxis Schmidt' },
	{ input: 'Frau Becker besetzt', result: 'not_reached', name: 'Frau Becker' },
	{ input: 'Praxis Klein, geht keiner ran', result: 'not_reached', name: 'Praxis Klein' },
	{ input: 'Herr Wolf - niemand erreicht', result: 'not_reached', name: 'Herr Wolf' },
	{ input: 'Lange, AB voll', result: 'not_reached', name: 'Lange' },
	{ input: 'Praxis Hoffmann AB ohne Nachricht', result: 'not_reached', name: 'Praxis Hoffmann' },
	{ input: 'Dr. Koch, kein Rückruf', result: 'not_reached', name: 'Dr. Koch' },
	{ input: 'nicht durchgekommen', result: 'not_reached', name: null },
	{ input: 'Praxis Braun nich erreicht', result: 'not_reached', name: 'Praxis Braun' },
	// Voicemail
	{ input: 'Praxis Neumann, AB besprochen', result: 'voicemail', name: 'Praxis Neumann' },
	{ input: 'Dr. Schulz, Nachricht hinterlassen', result: 'voicemail', name: 'Dr. Schulz' },
	{ input: 'auf den AB gesprochen', result: 'voicemail', name: null },
	{ input: 'frau richter anrufbeantworter', result: 'voicemail', name: 'Frau Richter' },
	{ input: 'Mailbox, Praxis Krüger', result: 'voicemail', name: 'Praxis Krüger' },
	// Rejected
	{ input: 'Praxis Fischer, Absage', result: 'rejected', name: 'Praxis Fischer' },
	{ input: 'Dr. Wagner: keine Kapazitäten', result: 'rejected', name: 'Dr. Wagner' },
	{ input: 'Meyer, keine neuen Patienten', result: 'rejected', name: 'Meyer' },
	{ input: 'praxis zimmermann abasge', result: 'rejected', name: 'Praxis Zimmermann' },
	{ input: 'Warteliste geschlossen', result: 'rejected', name: null },
	{ input: 'Praxis Hartmann, keine Warteliste', result: 'rejected', name: 'Praxis Hartmann' },
	{ input: 'Dr. Lehmann, voll', result: 'rejected', name: 'Dr. Lehmann' },
	{ input: 'Frau Krause sagt leider kein Platz frei', result: 'rejected', name: 'Frau Krause' },
	{ input: 'Aufnahmestopp', result: 'rejected', name: null },
	{ input: 'Praxis Werner, nimmt niemanden mehr', result: 'rejected', name: 'Praxis Werner' },
	{ input: 'Dr. Schmitt abgesagt, Wartezeit über 1 Jahr', result: 'rejected', weeks: 52 },
	{ input: 'absage, wartezeit 2 jahre', result: 'rejected', weeks: 104 },
	{ input: 'Praxis Roth, kein Termin frei', result: 'rejected', name: 'Praxis Roth' },
	// Waiting list
	{ input: 'Praxis Weber, Warteliste 6 Wo', result: 'waitlist', weeks: 6 },
	{ input: 'Dr. Peters warteliste ein Jahr', result: 'waitlist', name: 'Dr. Peters', weeks: 52 },
	{ input: 'auf die Liste gesetzt, ca 9 Monate', result: 'waitlist', weeks: 39 },
	{ input: 'Praxis Kaiser, Wartelsite 1,5 Jahre', result: 'waitlist', weeks: 78 },
	{ input: 'vorgemerkt, halbes Jahr', result: 'waitlist', weeks: 26 },
	{ input: 'Warteliste 3-4 Monate', result: 'waitlist', weeks: 17 },
	{ input: 'Frau Vogel, Wartezeit anderthalb Jahre', result: 'waitlist', weeks: 78 },
	{ input: 'Absage, aber Warteliste 12 Monate', result: 'waitlist', weeks: 52 },
	{ input: 'WARTELISTE 10 WOCHEN', result: 'waitlist', weeks: 10 },
	{ input: 'Praxis Jung, AB, Warteliste', result: 'waitlist', name: 'Praxis Jung', weeks: null },
	// Callback
	{ input: 'Dr. Weiß ruft morgen zurück', result: 'callback_pending', name: 'Dr. Weiß' },
	{ input: 'Praxis Lang, Rückruf versprochen', result: 'callback_pending', name: 'Praxis Lang' },
	{ input: 'rueckruf in 3 tagen', result: 'callback_pending', weeks: null },
	{ input: 'AB, Rückruf', result: 'callback_pending' },
	{ input: 'Frau Haas meldet sich nächste Woche', result: 'callback_pending', name: 'Frau Haas' },
	{ input: 'ruckruf freitag', result: 'callback_pending' },
	// Appointment
	{ input: 'Praxis Schäfer, Termin am 14.11.', result: 'appointment', name: 'Praxis Schäfer' },
	{ input: 'Termin bekommen!', result: 'appointment' },
	{ input: 'Dr. Berger Erstgespräch nächste Woche', result: 'appointment', name: 'Dr. Berger' },
	{ input: 'Sprechstundentermin über TSS', result: 'appointment', name: 'Terminservicestelle' },
	{ input: 'termin in 2 wochen', result: 'appointment', weeks: 2 },
	{ input: 'Probatorik ab Januar', result: 'appointment' },
	// Everyday phrasing: voice-message style, dialect, abbreviations
	{
		input: 'hab bei praxis meier angerufen aber da ging keiner ran',
		result: 'not_reached',
		name: 'Praxis Meier'
	},
	{ input: 'Dr Brandt ned erreicht', result: 'not_reached', name: 'Dr Brandt' },
	{ input: 'Praxis Simon - war besetzt, 3x probiert', result: 'not_reached', name: 'Praxis Simon' },
	{ input: 'Pr. Schulze AB drauf gesprochen', result: 'voicemail', name: 'Pr. Schulze' },
	{
		input: 'Hab ne Nachricht auf dem AB von Praxis Ludwig hinterlassen',
		result: 'voicemail',
		name: 'Praxis Ludwig'
	},
	{ input: 'praxis winter, mailbox, nix hinterlassen', result: 'voicemail', name: 'Praxis Winter' },
	{ input: 'dr. kaya - is voll, nimmt keine neuen', result: 'rejected', name: 'Dr. Kaya' },
	{ input: 'jo praxis horn nimmt grad niemand auf', result: 'rejected', name: 'Praxis Horn' },
	{ input: 'Praxis Baumann, keine Kapa', result: 'rejected', name: 'Praxis Baumann' },
	{ input: 'Praxis Nowak, Wartelsite zu', result: 'rejected', name: 'Praxis Nowak' },
	{
		input: 'Praxis Albrecht – leider keine Plätze frei',
		result: 'rejected',
		name: 'Praxis Albrecht'
	},
	{ input: 'Dr. Pohl hat abgelehnt', result: 'rejected', name: 'Dr. Pohl' },
	{
		input: 'Psychotherapeutin Engel, Absage per Mail',
		result: 'rejected',
		name: 'Psychotherapeutin Engel'
	},
	{
		input: 'Frau Yilmaz hat gesagt warteliste so 5 monate',
		result: 'waitlist',
		name: 'Frau Yilmaz',
		weeks: 22
	},
	{
		input: 'Dr. Arslan hat mich auf die warteliste gesetzt, ca. 1 Jahr',
		result: 'waitlist',
		name: 'Dr. Arslan',
		weeks: 52
	},
	{ input: 'Praxis Kühn: Wartezeit mind. 6 Monate', result: 'waitlist', weeks: 26 },
	{ input: 'Praxis Graf, 2 Jahre Wartezeit, trotzdem vorgemerkt', result: 'waitlist', weeks: 104 },
	{ input: 'Praxis Sommer: Rückruf zugesagt', result: 'callback_pending', name: 'Praxis Sommer' },
	{
		input: 'Frau Lorenz ruft zurück wenn was frei wird',
		result: 'callback_pending',
		name: 'Frau Lorenz'
	},
	{ input: 'tss angerufen termin nächste woche', result: 'appointment' },
	{ input: 'erstgespräch am 20.10. bei Dr. Frank', result: 'appointment', name: 'Dr. Frank' },
	{
		input: 'Frau Seidel sprechstunde nächsten dienstag',
		result: 'appointment',
		name: 'Frau Seidel'
	},
	// Other
	{ input: 'Praxis Busch', result: 'other', name: 'Praxis Busch' },
	{ input: '', result: 'other', name: null }
];

describe('parseContactInput – result', () => {
	it.each(CASES)('$input → $result', ({ input, result }) => {
		expect(parseContactInput(input, NOW).result.value).toBe(result);
	});

	it('recognises the result in at least 90 % of the cases', () => {
		const hits = CASES.filter(
			({ input, result }) => parseContactInput(input, NOW).result.value === result
		).length;
		expect(CASES.length).toBeGreaterThanOrEqual(40);
		expect(hits / CASES.length).toBeGreaterThanOrEqual(0.9);
	});

	it('has full confidence only when one result is clear', () => {
		expect(parseContactInput('Absage', NOW).result.confidence).toBeGreaterThan(0.9);
		expect(parseContactInput('AB, Warteliste', NOW).result.confidence).toBeLessThan(0.9);
		expect(parseContactInput('Praxis Busch', NOW).result.confidence).toBe(0);
	});
});

describe('parseContactInput – practice name', () => {
	const withName = CASES.filter((c) => c.name !== undefined);
	it.each(withName)('$input → $name', ({ input, name }) => {
		expect(parseContactInput(input, NOW).practiceName?.value ?? null).toBe(name);
	});

	it('is more confident with a marker word than without', () => {
		const marked = parseContactInput('Praxis Weber, Absage', NOW).practiceName!;
		const bare = parseContactInput('Weber, Absage', NOW).practiceName!;
		const loose = parseContactInput('Weber Absage', NOW).practiceName!;
		expect(marked.confidence).toBeGreaterThan(bare.confidence);
		expect(bare.confidence).toBeGreaterThan(loose.confidence);
		expect(loose.value).toBe('Weber');
	});

	it('handles "Dr." without a space', () => {
		expect(parseContactInput('Dr.Meier, Absage', NOW).practiceName?.value).toBe('Dr. Meier');
	});

	it('gives a lone marker low confidence', () => {
		const name = parseContactInput('Praxis, Absage', NOW).practiceName!;
		expect(name.value).toBe('Praxis');
		expect(name.confidence).toBeLessThan(0.6);
	});
});

describe('parseContactInput – waiting time', () => {
	const withWeeks = CASES.filter((c) => c.weeks !== undefined);
	it.each(withWeeks)('$input → $weeks weeks', ({ input, weeks }) => {
		expect(parseContactInput(input, NOW).waitTimeWeeks?.value ?? null).toBe(weeks);
	});

	it.each([
		['Warteliste 8 Mon.', 35],
		['Warteliste 8m', 35],
		['Warteliste 1 J', 52],
		['Warteliste 1/2 Jahr', 26],
		['Warteliste zwei Jahre', 104],
		['Warteliste 10 Tage', 1],
		['Warteliste 6 Wochen bis 2 Monate', 9],
		['Warteliste 2 bis 3 Monate', 13]
	])('%s → %i weeks', (input, weeks) => {
		expect(parseContactInput(input, NOW).waitTimeWeeks?.value).toBe(weeks);
	});

	it('ignores amounts without a unit, dates and absurd values', () => {
		expect(parseContactInput('Warteliste Platz 8', NOW).waitTimeWeeks).toBeNull();
		expect(parseContactInput('Termin am 12.11.', NOW).waitTimeWeeks).toBeNull();
		expect(parseContactInput('Warteliste 0 Monate', NOW).waitTimeWeeks).toBeNull();
		expect(parseContactInput('Warteliste 99 Jahre', NOW).waitTimeWeeks).toBeNull();
	});

	it('is less confident about one-letter units', () => {
		const short = parseContactInput('Warteliste 8m', NOW).waitTimeWeeks!;
		const long = parseContactInput('Warteliste 8 Monate', NOW).waitTimeWeeks!;
		expect(short.confidence).toBeLessThan(long.confidence);
	});
});

describe('parseContactInput – channel, kind and date', () => {
	it.each([
		['Praxis Weber, Absage', 'phone', 0.5],
		['angerufen, besetzt', 'phone', 0.9],
		['Praxis Weber per Mail angeschrieben, Absage', 'email', 0.85],
		['E-Mail an Dr. Kurz, keine Kapazität', 'email', 0.85],
		['Online-Formular ausgefüllt', 'online', 0.85],
		['persönlich vorbeigegangen, Warteliste', 'in_person', 0.85],
		['Mailbox', 'phone', 0.9]
	])('%s → %s', (input, channel, confidence) => {
		const parsed = parseContactInput(input, NOW).channel;
		expect(parsed.value).toBe(channel);
		expect(parsed.confidence).toBe(confidence);
	});

	it.each([
		['TSS angerufen, Termin am 3.11.', 'tss'],
		['116 117 Sprechstunde bekommen', 'tss'],
		['Ausbildungsinstitut, Warteliste 3 Monate', 'institut'],
		['Hochschulambulanz Absage', 'institut'],
		['Privatpraxis Dr. Sommer, Termin bekommen', 'privatpraxis'],
		['Kassenpraxis Dr. Sommer, Absage', 'kassenpraxis']
	])('%s → %s', (input, kind) => {
		expect(parseContactInput(input, NOW).practiceKind?.value).toBe(kind);
	});

	it('leaves the kind open when nothing hints at it', () => {
		expect(parseContactInput('Praxis Weber, Absage', NOW).practiceKind).toBeNull();
	});

	it('uses now as the date', () => {
		const at = parseContactInput('Absage', NOW).at;
		expect(at.value).toBe(NOW.toISOString());
	});

	it('understands "gestern" and "vorgestern"', () => {
		expect(new Date(parseContactInput('gestern Absage', NOW).at.value).getDate()).toBe(7);
		expect(new Date(parseContactInput('vorgestern Absage', NOW).at.value).getDate()).toBe(6);
	});

	it.each([
		['Praxis Weber 8:30 nicht erreicht', 8, 30, 8],
		['heute 8.30 Uhr AB', 8, 30, 8],
		['Absage um 7.15', 7, 15, 8],
		['gestern 12 Uhr Absage', 12, 0, 7],
		['vorgestern 17:45 Warteliste 3 Monate', 17, 45, 6],
		['gestern um 9 uhr besetzt', 9, 0, 7]
	])('takes the time from "%s"', (input, hours, minutes, day) => {
		const at = new Date(parseContactInput(input, NOW).at.value);
		expect([at.getHours(), at.getMinutes(), at.getDate()]).toEqual([hours, minutes, day]);
	});

	it('is more confident with a time than without', () => {
		const plain = parseContactInput('Absage', NOW).at.confidence;
		const timed = parseContactInput('8:30 Absage', NOW).at.confidence;
		const yesterday = parseContactInput('gestern Absage', NOW).at.confidence;
		const yesterdayTimed = parseContactInput('gestern 8:30 Absage', NOW).at.confidence;
		expect(timed).toBeGreaterThan(plain);
		expect(yesterdayTimed).toBeGreaterThan(yesterday);
	});

	it('does not read a time as practice name or waiting time', () => {
		const parsed = parseContactInput('Praxis Weber 8:30 nicht erreicht', NOW);
		expect(parsed.practiceName?.value).toBe('Praxis Weber');
		expect(parsed.waitTimeWeeks).toBeNull();
		expect(parseContactInput('Weber um 8 Uhr Absage', NOW).practiceName?.value).toBe('Weber');
		expect(parseContactInput('8.30 Uhr Warteliste', NOW).waitTimeWeeks).toBeNull();
		expect(parseContactInput('12 Uhr Warteliste 6 Wochen', NOW).waitTimeWeeks?.value).toBe(6);
	});

	it.each([
		'Termin am 14.11.',
		'Termin am 3.11. um 10 Uhr',
		'Rückruf um 14 Uhr',
		'ruft morgen 8:30 zurück',
		'heute 18:00 Absage',
		'Warteliste Platz 25:99',
		'Absage 24 Uhr'
	])('keeps the current time for "%s"', (input) => {
		expect(parseContactInput(input, NOW).at.value).toBe(NOW.toISOString());
	});

	it('keeps the trimmed raw input and never throws on odd input', () => {
		expect(parseContactInput('  Absage  ', NOW).rawInput).toBe('Absage');
		for (const odd of [',,,', '???', '12345', '—', 'ab ab ab', '\n\n', 'x'.repeat(5000)]) {
			expect(() => parseContactInput(odd, NOW)).not.toThrow();
		}
	});

	it('defaults to the current time', () => {
		const before = Date.now();
		const at = Date.parse(parseContactInput('Absage').at.value);
		expect(at).toBeGreaterThanOrEqual(before - 1);
	});
});
