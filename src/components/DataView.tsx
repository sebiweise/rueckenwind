'use client';

import { useId, useState } from 'react';
import { getDb } from '@/lib/data/db';
import { clearAll, updateJourney } from '@/lib/data/repository';
import { t } from '@/lib/i18n';

// Export and import need zod; loading them on demand keeps it out of every page's first load.
const loadBackup = () => import('@/lib/data/backup');

/** Backup as a file, restore from a file, delete everything. Nothing leaves the device. */
export function DataView() {
	const [message, setMessage] = useState('');
	const id = useId();

	async function exportFile() {
		const { createExport, exportFileName } = await loadBackup();
		const db = getDb();
		const now = new Date();
		const data = await createExport(db, now);
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = exportFileName(now);
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		await updateJourney(db, { lastExportAt: now.toISOString() });
		setMessage(t('data.exported'));
	}

	async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		const { hasData, importData, parseImport } = await loadBackup();
		const parsed = parseImport(await file.text());
		if (!parsed.ok) {
			setMessage(t(`data.importError.${parsed.error}`));
			return;
		}
		const db = getDb();
		if ((await hasData(db)) && !window.confirm(t('data.importConfirm'))) {
			setMessage(t('data.importCancelled'));
			return;
		}
		await importData(db, parsed.data);
		setMessage(t('data.imported'));
	}

	async function deleteAll() {
		if (!window.confirm(t('data.deleteConfirm'))) return;
		await clearAll(getDb());
		setMessage(t('data.deleted'));
	}

	return (
		<>
			<p className="toast toast-inline" role="status" aria-live="polite">
				{message}
			</p>

			<section className="card" aria-labelledby={`${id}-export`}>
				<h2 id={`${id}-export`}>{t('data.exportTitle')}</h2>
				<p>{t('data.exportText')}</p>
				<button type="button" className="button button-primary" onClick={exportFile}>
					{t('data.export')}
				</button>
			</section>

			<section className="card" aria-labelledby={`${id}-import`}>
				<h2 id={`${id}-import`}>{t('data.importTitle')}</h2>
				<p>{t('data.importText')}</p>
				<label className="button file-button">
					{t('data.import')}
					<input
						type="file"
						accept="application/json,.json"
						className="visually-hidden"
						onChange={importFile}
					/>
				</label>
			</section>

			<section className="card" aria-labelledby={`${id}-delete`}>
				<h2 id={`${id}-delete`}>{t('data.deleteTitle')}</h2>
				<p>{t('data.deleteText')}</p>
				<button type="button" className="button" onClick={deleteAll}>
					{t('data.delete')}
				</button>
			</section>
		</>
	);
}
