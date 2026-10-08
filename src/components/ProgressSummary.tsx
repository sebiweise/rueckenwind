'use client';

import Link from 'next/link';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import { computeProgress } from '@/lib/domain';
import { t } from '@/lib/i18n';

/** "4 Nachweise gesammelt": rejections shown as collected proof, never as failure. */
export function ProgressSummary({ linkToContacts = false }: { linkToContacts?: boolean }) {
	const practices = usePractices();
	const attempts = useAttempts();
	if (!practices || !attempts) return <p className="muted">{t('common.loading')}</p>;

	const progress = computeProgress(practices, attempts);
	const count =
		progress.proofCount === 0
			? t('progress.countNone')
			: progress.proofCount === 1
				? t('progress.countOne')
				: t('progress.count', { count: progress.proofCount });

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
			{linkToContacts && progress.attemptCount > 0 && (
				<p>
					<Link href="/kontakte/">{t('nav.contacts')}</Link>
				</p>
			)}
		</section>
	);
}
