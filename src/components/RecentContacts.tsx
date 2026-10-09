'use client';

import Link from 'next/link';
import { PracticeAvatar } from '@/components/PracticeAvatar';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import { formatWaitTime } from '@/lib/format';
import { t } from '@/lib/i18n';

/** The last few contacts, shown next to the path on wide screens. */
export function RecentContacts() {
	const practices = usePractices();
	const attempts = useAttempts();
	if (!practices || !attempts || attempts.length === 0) return null;

	const byId = new Map(practices.map((practice) => [practice.id, practice]));
	const seen = new Set<string>();
	const latest = attempts.filter((attempt) => {
		if (seen.has(attempt.practiceId) || !byId.has(attempt.practiceId)) return false;
		seen.add(attempt.practiceId);
		return true;
	});

	return (
		<section className="card recent" aria-labelledby="recent-title">
			<div className="section-head">
				<h2 id="recent-title">{t('recent.title')}</h2>
				<Link href="/kontakte/">{t('recent.all')}</Link>
			</div>
			<ul className="recent-list">
				{latest.slice(0, 3).map((attempt) => {
					const practice = byId.get(attempt.practiceId)!;
					return (
						<li key={attempt.id}>
							<PracticeAvatar practice={practice} />
							<span className="recent-text">
								<span className="recent-name">{practice.name}</span>
								<span className="muted">
									{t(`result.${attempt.result}`)}
									{attempt.waitTimeWeeks ? ` · ${formatWaitTime(attempt.waitTimeWeeks)}` : ''}
								</span>
							</span>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
