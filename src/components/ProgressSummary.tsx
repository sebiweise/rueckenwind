'use client';

import Link from 'next/link';
import { CheckIcon, ChevronRightIcon } from '@/components/Icons';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import { computeProgress, proofPebbles, type Progress } from '@/lib/domain';
import { t } from '@/lib/i18n';

/** One stone per proof, then a few fading open ones. Decorative: the count says it. */
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

/** "3 Nachweise gesammelt": rejections shown as collected proof, never as failure. */
function ProofCount({ progress }: Readonly<{ progress: Progress | undefined }>) {
	if (!progress) return <p className="progress-count muted">{t('common.loading')}</p>;
	if (progress.proofCount === 0) {
		return <p className="progress-count progress-none">{t('progress.countNone')}</p>;
	}
	return (
		<p className="progress-count">
			<span className="progress-number">{progress.proofCount}</span>{' '}
			<span>
				{progress.proofCount === 1 ? t('progress.countLabelOne') : t('progress.countLabel')}
			</span>
		</p>
	);
}

function useProgress(): Progress | undefined {
	const practices = usePractices();
	const attempts = useAttempts();
	// Undefined while prerendering and loading: the card keeps its shape with fixed texts,
	// so the page does not jump and the largest text is painted right away.
	return practices && attempts ? computeProgress(practices, attempts) : undefined;
}

/** The small proof card on "Dein Weg": count, stones and the way to the proof page. */
export function ProgressSummary() {
	const progress = useProgress();
	return (
		<section className="card progress" aria-labelledby="progress-title" aria-busy={!progress}>
			<h2 id="progress-title" className="visually-hidden">
				{t('progress.title')}
			</h2>
			<ProofCount progress={progress} />
			{progress && progress.attemptCount > 0 && (
				<p className="muted progress-sub">
					{t('progress.attempts', {
						count: progress.attemptCount,
						practices: progress.practiceCount
					})}
				</p>
			)}
			<Pebbles proofCount={progress?.proofCount ?? 0} />
			<Link href="/daten/" className="row-link">
				{t('progress.open')}
				<ChevronRightIcon />
			</Link>
		</section>
	);
}

/** The proof in detail, on top of the proof page. */
export function ProgressDetails() {
	const progress = useProgress();
	return (
		<div className="progress progress-details" aria-busy={!progress}>
			<div className="paper" aria-hidden="true">
				<span />
				<span />
				<span />
				<span />
				<span />
			</div>
			<ProofCount progress={progress} />
			<Pebbles proofCount={progress?.proofCount ?? 0} />
			{progress && progress.attemptCount > 0 && (
				<p className="check-line">
					<CheckIcon />
					{t('progress.attempts', {
						count: progress.attemptCount,
						practices: progress.practiceCount
					})}
				</p>
			)}
			{progress?.tssContacted && (
				<p className="check-line">
					<CheckIcon />
					{t('progress.tss')}
				</p>
			)}
			<p className="muted">{t('progress.orientation')}</p>
		</div>
	);
}
