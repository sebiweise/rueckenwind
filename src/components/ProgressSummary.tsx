'use client';

import Link from 'next/link';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import { computeProgress } from '@/lib/domain';
import { t } from '@/lib/i18n';

/** "4 Nachweise gesammelt": rejections shown as collected proof, never as failure. */
function proofCountText(proofCount: number): string {
	if (proofCount === 0) return t('progress.countNone');
	if (proofCount === 1) return t('progress.countOne');
	return t('progress.count', { count: proofCount });
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
				<p className="muted">{t('progress.orientation')}</p>
			</section>
		);
	}

	const progress = computeProgress(practices, attempts);
	const count = proofCountText(progress.proofCount);

	return (
		<section className="card progress" aria-labelledby="progress-title">
			<h2 id="progress-title">{t('progress.title')}</h2>
			<p className="progress-count">{count}</p>
			{progress.attemptCount > 0 && (
				<p className="muted">
					{t('progress.attempts', {
						count: progress.attemptCount,
						practices: progress.practiceCount
					})}
				</p>
			)}
			{progress.tssContacted && <p>{t('progress.tss')}</p>}
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
