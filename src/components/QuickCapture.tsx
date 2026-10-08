'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PlusIcon } from '@/components/Icons';
import { getDb } from '@/lib/data/db';
import { usePractices } from '@/lib/data/hooks';
import { recordContact } from '@/lib/data/repository';
import {
	CONTACT_RESULTS,
	countsForProof,
	parseContactInput,
	type ContactResult
} from '@/lib/domain';
import { formatDateTime, formatWaitTime, fromDateTimeLocal, toDateTimeLocal } from '@/lib/format';
import { t } from '@/lib/i18n';

/** Results offered as one-tap buttons, as an alternative to typing. */
const QUICK_RESULTS: ContactResult[] = [
	'not_reached',
	'rejected',
	'waitlist',
	'callback_pending',
	'appointment'
];

/** Below this confidence a chip is marked as unsure and invites a correction. */
const SURE = 0.7;

type Editor = 'practice' | 'result' | 'wait' | 'date' | null;

interface Overrides {
	name?: string;
	result?: ContactResult;
	weeks?: number | null;
	at?: string;
}

/**
 * The floating "Kontakt notieren" button and its dialog: one line of text,
 * parsed locally into chips that can be corrected with a tap, saved with one more.
 */
export function QuickCapture() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [text, setText] = useState('');
	const [overrides, setOverrides] = useState<Overrides>({});
	const [editor, setEditor] = useState<Editor>(null);
	const [message, setMessage] = useState('');
	const practices = usePractices();
	const ids = useId();

	const parsed = useMemo(() => parseContactInput(text), [text]);
	const name = overrides.name ?? parsed.practiceName?.value ?? '';
	const result = overrides.result ?? parsed.result.value;
	const weeks = overrides.weeks === undefined ? parsed.waitTimeWeeks?.value : overrides.weeks;
	const at = overrides.at ?? parsed.at.value;
	const hasInput = text.trim() !== '' || overrides.result !== undefined;

	const unsure = {
		practice: overrides.name === undefined && (parsed.practiceName?.confidence ?? 0) < SURE,
		result: overrides.result === undefined && parsed.result.confidence < SURE
	};

	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(() => setMessage(''), 8000);
		return () => clearTimeout(timer);
	}, [message]);

	function reset() {
		setText('');
		setOverrides({});
		setEditor(null);
	}

	function open() {
		reset();
		dialogRef.current?.showModal();
	}

	function close() {
		dialogRef.current?.close();
	}

	async function save(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!hasInput) return;
		try {
			const { practice, attempt } = await recordContact(getDb(), {
				practiceName: name.trim() || t('capture.unnamedPractice'),
				practiceKind: parsed.practiceKind?.value,
				result,
				at,
				channel: parsed.channel.value,
				waitTimeWeeks: weeks ?? undefined,
				rawInput: text.trim() || undefined
			});
			setMessage(
				countsForProof(attempt, practice)
					? t('capture.saved.counts', { result: t(`result.${result}`) })
					: t(`capture.saved.${result}`)
			);
			close();
		} catch {
			setMessage(t('capture.error'));
		}
	}

	const toggle = (which: Editor) => setEditor((current) => (current === which ? null : which));

	return (
		<>
			<button type="button" className="fab" onClick={open}>
				<PlusIcon />
				<span className="fab-label">{t('capture.open')}</span>
			</button>

			<p className="toast" role="status" aria-live="polite">
				{message}
			</p>

			<dialog ref={dialogRef} className="capture" aria-labelledby={`${ids}-title`} onClose={reset}>
				<form onSubmit={save}>
					<h2 id={`${ids}-title`}>{t('capture.title')}</h2>

					<label htmlFor={`${ids}-text`}>{t('capture.inputLabel')}</label>
					<input
						id={`${ids}-text`}
						type="text"
						autoComplete="off"
						autoFocus
						enterKeyHint="done"
						placeholder={t('capture.placeholder')}
						value={text}
						onChange={(event) => setText(event.target.value)}
					/>

					<fieldset className="quick-buttons">
						<legend>{t('capture.quickLabel')}</legend>
						{QUICK_RESULTS.map((quick) => (
							<button
								key={quick}
								type="button"
								className="button"
								aria-pressed={overrides.result === quick}
								onClick={() =>
									setOverrides((current) => ({
										...current,
										result: current.result === quick ? undefined : quick
									}))
								}
							>
								{t(`result.${quick}`)}
							</button>
						))}
					</fieldset>

					{hasInput && (
						<section className="preview" aria-label={t('capture.preview')}>
							<p className="muted">{t('capture.preview')}</p>
							<ul className="chips">
								<li>
									<Chip
										label={t('capture.practice')}
										value={name || t('capture.unnamedPractice')}
										unsure={unsure.practice}
										expanded={editor === 'practice'}
										onClick={() => toggle('practice')}
									/>
								</li>
								<li>
									<Chip
										label={t('capture.result')}
										value={t(`result.${result}`)}
										unsure={unsure.result}
										expanded={editor === 'result'}
										onClick={() => toggle('result')}
									/>
								</li>
								<li>
									<Chip
										label={t('capture.waitTime')}
										value={weeks ? formatWaitTime(weeks) : t('capture.noWait')}
										expanded={editor === 'wait'}
										onClick={() => toggle('wait')}
									/>
								</li>
								<li>
									<Chip
										label={t('capture.date')}
										value={formatDateTime(at)}
										expanded={editor === 'date'}
										onClick={() => toggle('date')}
									/>
								</li>
							</ul>

							{editor === 'practice' && (
								<div className="editor">
									<label htmlFor={`${ids}-name`}>{t('capture.practice')}</label>
									<input
										id={`${ids}-name`}
										type="text"
										list={`${ids}-practices`}
										value={name}
										onChange={(event) =>
											setOverrides((current) => ({ ...current, name: event.target.value }))
										}
									/>
									<datalist id={`${ids}-practices`}>
										{practices?.map((practice) => (
											<option key={practice.id} value={practice.name} />
										))}
									</datalist>
								</div>
							)}

							{editor === 'result' && (
								<fieldset className="editor options">
									<legend>{t('capture.result')}</legend>
									{CONTACT_RESULTS.map((option) => (
										<label key={option} className="option">
											<input
												type="radio"
												name={`${ids}-result`}
												checked={result === option}
												onChange={() => {
													setOverrides((current) => ({ ...current, result: option }));
													setEditor(null);
												}}
											/>
											{t(`result.${option}`)}
										</label>
									))}
								</fieldset>
							)}

							{editor === 'wait' && (
								<div className="editor">
									<label htmlFor={`${ids}-weeks`}>{t('capture.weeksInput')}</label>
									<input
										id={`${ids}-weeks`}
										type="number"
										inputMode="numeric"
										min={0}
										max={520}
										value={weeks ?? ''}
										onChange={(event) =>
											setOverrides((current) => ({
												...current,
												weeks: event.target.value === '' ? null : Number(event.target.value)
											}))
										}
									/>
								</div>
							)}

							{editor === 'date' && (
								<div className="editor">
									<label htmlFor={`${ids}-date`}>{t('capture.date')}</label>
									<input
										id={`${ids}-date`}
										type="datetime-local"
										value={toDateTimeLocal(at)}
										onChange={(event) => {
											const value = fromDateTimeLocal(event.target.value);
											if (value) setOverrides((current) => ({ ...current, at: value }));
										}}
									/>
								</div>
							)}
						</section>
					)}

					<div className="actions">
						<button type="submit" className="button button-primary" disabled={!hasInput}>
							{t('common.save')}
						</button>
						<button type="button" className="button" onClick={close}>
							{t('common.cancel')}
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}

interface ChipProps {
	label: string;
	value: string;
	unsure?: boolean;
	expanded: boolean;
	onClick: () => void;
}

function Chip({ label, value, unsure = false, expanded, onClick }: Readonly<ChipProps>) {
	return (
		<button
			type="button"
			className={unsure ? 'chip chip-unsure' : 'chip'}
			aria-expanded={expanded}
			onClick={onClick}
		>
			<span className="chip-label">{label}</span>
			<span className="chip-value">{value}</span>
			{unsure && <span className="chip-hint">{t('capture.unsure')}</span>}
		</button>
	);
}
