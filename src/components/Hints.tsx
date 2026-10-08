'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAttempts, useJourney } from '@/lib/data/hooks';
import { shouldRemindExport, shouldSuggestPause } from '@/lib/domain';
import { t } from '@/lib/i18n';

/** Gentle, dismissable hints: a pause after a hard day, a backup after many entries. */
export function Hints() {
	const attempts = useAttempts();
	const journey = useJourney();
	const [dismissed, setDismissed] = useState<string[]>([]);
	if (!attempts || !journey) return null;

	const hints: { id: string; text: string; link?: { href: string; label: string } }[] = [];
	if (shouldSuggestPause(attempts)) hints.push({ id: 'pause', text: t('hint.pause') });
	if (shouldRemindExport(attempts, journey.lastExportAt)) {
		hints.push({
			id: 'export',
			text: t('hint.export'),
			link: { href: '/daten/', label: t('hint.exportLink') }
		});
	}

	return hints
		.filter((hint) => !dismissed.includes(hint.id))
		.map((hint) => (
			<aside key={hint.id} className="notice hint" data-hint={hint.id}>
				<p>{hint.text}</p>
				<p className="hint-actions">
					{hint.link && <Link href={hint.link.href}>{hint.link.label}</Link>}
					<button
						type="button"
						className="button button-quiet"
						onClick={() => setDismissed((current) => [...current, hint.id])}
					>
						{t('common.dismiss')}
					</button>
				</p>
			</aside>
		));
}
