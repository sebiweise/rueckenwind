'use client';

import Link from 'next/link';
import { CheckIcon } from '@/components/Icons';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import { computeProgress, proofPebbles } from '@/lib/domain';
import { t } from '@/lib/i18n';

/** "4 Nachweise gesammelt": rejections shown as collected proof, never as failure. */
function ProofCount({ proofCount }: Readonly<{ proofCount: number }>) {
	if (proofCount === 0) return <p className="progress-count">{t('progress.countNone')}</p>;
	return (
		<p className="progress-count">
			<span className="progress-number">{proofCount}</span>{' '}
			{proofCount === 1 ? t('progress.countLabelOne') : t('progress.countLabel')}
		</p>
	);
}

/** One stone per proof, then a few fading open ones. Decorative: the count above says it. */
function Pebbles({ proofCount }: Readonly<{ proofCount: number }>) {
	const { filled, open, more } = proofPebbles(proofCount);
	return (
		<div className="pebbles" aria-hidden="true">
			{Array.from({ length: filled }, (_, index) => (
				<span key={`f${index}`} className="pebble" />
			))}
			{more > 0 && <span className="pebbles-more">+{more}</span>}
			{Array.from({ length: open }, (_, index) => (
				<span key={`o${index}`} className="pebble pebble-open" />
			))}
		</div>
	);
}

export function ProgressSummary({
	linkToContacts = false
}: Readonly<{ linkToContacts?: boolean }>) {
	const practices = usePractices();
	const attempts = useAttempts();
	// Prerendered and shown until the data has loaded: the same card with its fixed texts,
	// so the page does not jump and the largest text is painted right away.
	if (!practices || !attempts) {
		return (
			<section className="card progress" aria-labelledby="progress-title" aria-busy="true">
				<h2 id="progress-title">{t('progress.title')}</h2>
				<p className="progress-count muted">{t('common.loading')}</p>
				<Pebbles proofCount={0} />
				<p className="muted">{t('progress.orientation')}</p>
			</section>
		);
	}

	const progress = computeProgress(practices, attempts);

	return (
		<section className="card progress" aria-labelledby="progress-title">
			<h2 id="progress-title">{t('progress.title')}</h2>
			<ProofCount proofCount={progress.proofCount} />
			<Pebbles proofCount={progress.proofCount} />
			{progress.attemptCount > 0 && (
				<p className="check-line">
					<CheckIcon />
					{t('progress.attempts', {
						count: progress.attemptCount,
						practices: progress.practiceCount
					})}
				</p>
			)}
			{progress.tssContacted && (
				<p className="check-line">
					<CheckIcon />
					{t('progress.tss')}
				</p>
			)}
			<p className="muted">{t('progress.orientation')}</p>
			{progress.attemptCount > 0 && (
				<p className="hint-actions">
					{linkToContacts && <Link href="/kontakte/">{t('nav.contacts')}</Link>}
					<Link href="/daten/#nachweis">{t('progress.createProof')}</Link>
				</p>
			)}
		</section>
	);
}
