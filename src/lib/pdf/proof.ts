import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { APP_NAME } from '@/lib/config';
import { attemptPeriod, computeProgress, type ContactAttempt, type Practice } from '@/lib/domain';
import { formatDate, formatWaitTime } from '@/lib/format';
import { t } from '@/lib/i18n';

export interface ProofInput {
	practices: Practice[];
	attempts: ContactAttempt[];
	displayName?: string;
	now?: Date;
}

const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

const signatureLine = (label: string): Content => ({
	stack: [
		{
			canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.5 }],
			margin: [0, 40, 0, 4]
		},
		{ text: label, style: 'small' }
	]
});

/**
 * Builds the pdfmake document for the reimbursement proof: header, period,
 * every attempt in a table, the count, the TSS contact and room to sign.
 * Pure function, so the layout can be tested without a browser.
 */
export function buildProofDocument({
	practices,
	attempts,
	displayName,
	now = new Date()
}: ProofInput): TDocumentDefinitions {
	const byId = new Map(practices.map((practice) => [practice.id, practice]));
	const sorted = [...attempts].sort((a, b) => a.at.localeCompare(b.at));
	const period = attemptPeriod(sorted);
	const progress = computeProgress(practices, sorted);
	const tssAttempts = sorted.filter((attempt) => byId.get(attempt.practiceId)?.kind === 'tss');

	const header: TableCell[] = [
		t('pdf.col.number'),
		t('pdf.col.date'),
		t('pdf.col.time'),
		t('pdf.col.practice'),
		t('pdf.col.channel'),
		t('pdf.col.result'),
		t('pdf.col.wait')
	].map((text) => ({ text, style: 'tableHeader' }));

	const rows: TableCell[][] = sorted.map((attempt, index) => {
		const practice = byId.get(attempt.practiceId);
		const practiceCell: TableCell = practice
			? {
					stack: [
						practice.name,
						...(practice.phone ? [{ text: practice.phone, style: 'small' }] : []),
						{ text: t(`kind.${practice.kind}`), style: 'small' }
					]
				}
			: '–';
		return [
			String(index + 1),
			formatDate(attempt.at),
			time.format(new Date(attempt.at)),
			practiceCell,
			t(`channel.${attempt.channel}`),
			t(`result.${attempt.result}`),
			attempt.waitTimeWeeks ? formatWaitTime(attempt.waitTimeWeeks) : '–'
		];
	});

	const name = displayName?.trim();

	return {
		pageSize: 'A4',
		pageMargins: [40, 50, 40, 50],
		info: { title: t('pdf.title'), creator: APP_NAME, producer: APP_NAME },
		defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.2 },
		styles: {
			title: { fontSize: 16, bold: true, margin: [0, 0, 0, 12] },
			heading: { fontSize: 12, bold: true, margin: [0, 16, 0, 6] },
			tableHeader: { bold: true, fillColor: '#eeeeee' },
			small: { fontSize: 8, color: '#555555' },
			label: { bold: true }
		},
		footer: (page, pages) => ({
			text: t('pdf.footer', { app: APP_NAME, page, pages }),
			style: 'small',
			alignment: 'center',
			margin: [0, 20, 0, 0]
		}),
		content: [
			{ text: t('pdf.title'), style: 'title' },
			{
				columns: [
					{ width: 90, text: `${t('pdf.name')}:`, style: 'label' },
					name
						? { width: '*', text: name }
						: {
								width: '*',
								canvas: [{ type: 'line', x1: 0, y1: 12, x2: 250, y2: 12, lineWidth: 0.5 }]
							}
				],
				margin: [0, 0, 0, 4]
			},
			{
				columns: [
					{ width: 90, text: `${t('pdf.period')}:`, style: 'label' },
					{
						width: '*',
						text: period
							? `${formatDate(period.from)} – ${formatDate(period.to)}`
							: t('pdf.noPeriod')
					}
				],
				margin: [0, 0, 0, 4]
			},
			{
				columns: [
					{ width: 90, text: `${t('pdf.created')}:`, style: 'label' },
					{ width: '*', text: formatDate(now.toISOString()) }
				],
				margin: [0, 0, 0, 12]
			},
			{ text: t('pdf.intro') },
			rows.length === 0
				? { text: t('pdf.empty'), italics: true, margin: [0, 8, 0, 0] }
				: {
						table: {
							headerRows: 1,
							dontBreakRows: true,
							widths: [22, 58, 36, '*', 46, 70, 56],
							body: [header, ...rows]
						},
						layout: 'lightHorizontalLines',
						margin: [0, 8, 0, 0]
					},
			{ text: t('pdf.summaryTitle'), style: 'heading' },
			{
				ul: [
					t('pdf.summary.attempts', { count: progress.attemptCount }),
					t('pdf.summary.unsuccessful', { count: progress.proofCount })
				]
			},
			{ text: t('pdf.tssTitle'), style: 'heading' },
			tssAttempts.length === 0
				? { text: t('pdf.tss.none') }
				: {
						ul: tssAttempts.map((attempt) =>
							t('pdf.tss.contacted', {
								date: formatDate(attempt.at),
								result: t(`result.${attempt.result}`)
							})
						)
					},
			{
				stack: [
					{ text: t('pdf.signatureTitle'), style: 'heading' },
					{ text: t('pdf.signatureText') },
					{ columns: [signatureLine(t('pdf.place')), signatureLine(t('pdf.signature'))] }
				],
				unbreakable: true
			}
		]
	};
}

/** File name for the proof, e.g. "nachweis-psychotherapie-2026-10-08.pdf". */
export function proofFileName(now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `nachweis-psychotherapie-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.pdf`;
}
