import path from 'node:path';
import { createRequire } from 'node:module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import type { ContactAttempt, ContactResult, Practice } from '@/lib/domain';
import { buildProofDocument, proofFileName } from './proof';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const require = createRequire(import.meta.url);
const NOW = new Date('2026-10-08T10:00:00Z');
const RESULTS: ContactResult[] = [
	'rejected',
	'waitlist',
	'not_reached',
	'voicemail',
	'callback_pending'
];

function fixture(count: number) {
	const practices: Practice[] = [
		{
			id: 'tss',
			name: 'Terminservicestelle',
			kind: 'tss',
			createdAt: '2026-09-01T08:00:00.000Z'
		},
		...Array.from({ length: Math.max(count - 1, 0) }, (_, i) => ({
			id: `p${i}`,
			name: i === 0 ? 'Praxis Müller-Lüdenscheid, Ärztehaus Größe' : `Praxis Nr. ${i}`,
			phone: i === 0 ? '030 123456' : undefined,
			kind: 'kassenpraxis' as const,
			createdAt: '2026-09-01T08:00:00.000Z'
		}))
	];
	const attempts: ContactAttempt[] = Array.from({ length: count }, (_, i) => ({
		id: `a${i}`,
		practiceId: i === count - 1 ? 'tss' : `p${i}`,
		at: new Date(Date.UTC(2026, 8, 1 + i, 7, 15)).toISOString(),
		channel: 'phone',
		result: i === count - 1 ? 'appointment' : RESULTS[i % RESULTS.length],
		waitTimeWeeks: i % 3 === 0 ? 35 : undefined
	}));
	return { practices, attempts };
}

async function render(definition: TDocumentDefinitions): Promise<{ pages: number; text: string }> {
	// pdfmake's Node build with the same Roboto font the browser build embeds.
	const pdfmake = require('pdfmake');
	const fonts = path.join(path.dirname(require.resolve('pdfmake/package.json')), 'fonts', 'Roboto');
	pdfmake.addFonts({
		Roboto: {
			normal: path.join(fonts, 'Roboto-Regular.ttf'),
			bold: path.join(fonts, 'Roboto-Medium.ttf'),
			italics: path.join(fonts, 'Roboto-Italic.ttf'),
			bolditalics: path.join(fonts, 'Roboto-MediumItalic.ttf')
		}
	});
	const buffer: Buffer = await pdfmake.createPdf(definition).getBuffer();
	const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
	let text = '';
	for (let n = 1; n <= pdf.numPages; n++) {
		const content = await (await pdf.getPage(n)).getTextContent();
		text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
	}
	return { pages: pdf.numPages, text };
}

describe('buildProofDocument', () => {
	it.each([0, 1, 50])('matches the snapshot with %i entries', (count) => {
		const definition = buildProofDocument({
			...fixture(count),
			displayName: 'Kim Öztürk',
			now: NOW
		});
		expect(JSON.stringify(definition.content, null, 1)).toMatchSnapshot();
	});

	it('leaves a line for the name when none is given', () => {
		const content = JSON.stringify(buildProofDocument({ ...fixture(1), now: NOW }).content);
		expect(content).toContain('"canvas"');
		expect(content).not.toContain('Kim');
	});

	it('names the file after the date', () => {
		expect(proofFileName(new Date(2026, 9, 8))).toBe('nachweis-psychotherapie-2026-10-08.pdf');
	});
});

describe('rendered PDF', () => {
	it('is valid with no entries', async () => {
		const { pages, text } = await render(buildProofDocument({ ...fixture(0), now: NOW }));
		expect(pages).toBe(1);
		expect(text).toContain('Es wurden noch keine Kontaktversuche erfasst.');
		expect(text).toContain('Kein Kontakt zur Terminservicestelle erfasst.');
		expect(text).toContain('Seite 1 von 1');
	});

	it('keeps umlauts and lists every entry', async () => {
		const { pages, text } = await render(
			buildProofDocument({ ...fixture(50), displayName: 'Jürgen Weiß-Äßler', now: NOW })
		);
		expect(pages).toBeGreaterThan(1);
		for (const expected of [
			'Nachweis über Anfragen für einen Psychotherapieplatz',
			'Jürgen Weiß-Äßler',
			'Praxis Müller-Lüdenscheid, Ärztehaus Größe',
			'Kontaktversuche insgesamt: 50',
			'Kassenpraxen ohne Behandlungsplatz (Absage, Warteliste oder nicht erreicht): 30',
			'Kontakt am 20.10.2026: Termin bekommen',
			'Unterschrift',
			`Seite ${pages} von ${pages}`
		]) {
			expect(text).toContain(expected);
		}
		expect(text).toContain('50');
	});
});
