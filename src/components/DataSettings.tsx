'use client';

import { useId, useState } from 'react';
import { ChevronRightIcon, DownloadIcon, TrashIcon, UploadIcon } from '@/components/Icons';
import { getDb } from '@/lib/data/db';
import { useJourney } from '@/lib/data/hooks';
import { clearAll, updateJourney } from '@/lib/data/repository';
import { formatDate } from '@/lib/format';
import { t } from '@/lib/i18n';

// Export and import need zod; loading them on demand keeps it out of every page's first load.
const loadBackup = () => import('@/lib/data/backup');

/** Backup as a file, restore from a file, delete everything. Nothing leaves the device. */
export function DataSettings() {
	const [message, setMessage] = useState('');
	const journey = useJourney();
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
		if ((await hasData(db)) && !globalThis.confirm(t('data.importConfirm'))) {
			setMessage(t('data.importCancelled'));
			return;
		}
		await importData(db, parsed.data);
		setMessage(t('data.imported'));
	}

	async function deleteAll() {
		if (!globalThis.confirm(t('data.deleteConfirm'))) return;
		await clearAll(getDb());
		setMessage(t('data.deleted'));
	}

	let lastExport = '';
	if (journey) {
		lastExport = journey.lastExportAt
			? t('data.lastExport', { date: formatDate(journey.lastExportAt) })
			: t('data.neverExported');
	}

	return (
		<section id="daten" aria-labelledby={`${id}-title`}>
			<h2 id={`${id}-title`} className="group-title">
				{t('data.groupTitle')}
			</h2>
			<p className="toast toast-inline" role="status" aria-live="polite">
				{message}
			</p>
			<ul className="rows">
				<li>
					<button type="button" className="row" onClick={exportFile}>
						<span className="row-icon">
							<DownloadIcon />
						</span>
						<span className="row-text">
							{t('data.export')}
							<small>{lastExport || t('data.exportText')}</small>
						</span>
						<ChevronRightIcon className="icon row-chevron" />
					</button>
				</li>
				<li>
					<label className="row file-button">
						<span className="row-icon">
							<UploadIcon />
						</span>
						<span className="row-text">
							{t('data.import')}
							<small>{t('data.importText')}</small>
						</span>
						<ChevronRightIcon className="icon row-chevron" />
						<input
							type="file"
							accept="application/json,.json"
							className="visually-hidden"
							onChange={importFile}
						/>
					</label>
				</li>
				<li>
					<button type="button" className="row row-quiet" onClick={deleteAll}>
						<span className="row-icon">
							<TrashIcon />
						</span>
						<span className="row-text">
							{t('data.delete')}
							<small>{t('data.deleteText')}</small>
						</span>
						<ChevronRightIcon className="icon row-chevron" />
					</button>
				</li>
			</ul>
		</section>
	);
}
