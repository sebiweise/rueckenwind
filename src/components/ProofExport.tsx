'use client';

import { useId, useState } from 'react';
import { getDb } from '@/lib/data';
import { useJourney } from '@/lib/data/hooks';
import { listAttempts, listPractices, updateJourney } from '@/lib/data/repository';
import { t } from '@/lib/i18n';
import { createPdfBlob } from '@/lib/pdf/create';
import { buildProofDocument, proofFileName } from '@/lib/pdf/proof';

/** The proof PDF, built entirely in the browser. The name is asked for only here. */
export function ProofExport() {
	const journey = useJourney();
	const id = useId();
	const [name, setName] = useState<string | null>(null);
	const [status, setStatus] = useState('');
	const [busy, setBusy] = useState(false);
	const displayName = name ?? journey?.displayName ?? '';

	async function create() {
		setBusy(true);
		setStatus(t('proof.creating'));
		try {
			const db = getDb();
			const now = new Date();
			const [practices, attempts] = await Promise.all([listPractices(db), listAttempts(db)]);
			await updateJourney(db, { displayName: displayName.trim() || undefined });
			const blob = await createPdfBlob(
				buildProofDocument({ practices, attempts, displayName, now })
			);
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = proofFileName(now);
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			setStatus(t('proof.created'));
		} catch {
			setStatus(t('proof.error'));
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className="card" id="nachweis" aria-labelledby={`${id}-title`}>
			<h2 id={`${id}-title`}>{t('proof.title')}</h2>
			<p>{t('proof.text')}</p>
			<div className="form">
				<label htmlFor={`${id}-name`}>{t('proof.name')}</label>
				<input
					id={`${id}-name`}
					type="text"
					autoComplete="name"
					value={displayName}
					aria-describedby={`${id}-hint`}
					onChange={(event) => setName(event.target.value)}
				/>
				<p id={`${id}-hint`} className="muted">
					{t('proof.nameHint')}
				</p>
			</div>
			<button type="button" className="button button-primary" onClick={create} disabled={busy}>
				{t('proof.create')}
			</button>
			<p role="status" aria-live="polite">
				{status}
			</p>
		</section>
	);
}
