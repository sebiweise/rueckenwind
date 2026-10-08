'use client';

import { useId, useState } from 'react';
import { getDb } from '@/lib/data/db';
import { useAttempts, usePractices } from '@/lib/data/hooks';
import {
	createPractice,
	deleteAttempt,
	deletePractice,
	updateAttempt,
	updatePractice
} from '@/lib/data/repository';
import {
	CONTACT_CHANNELS,
	CONTACT_RESULTS,
	PRACTICE_KINDS,
	type ContactAttempt,
	type ContactChannel,
	type ContactResult,
	type Practice,
	type PracticeKind
} from '@/lib/domain';
import { formatDateTime, formatWaitTime, fromDateTimeLocal, toDateTimeLocal } from '@/lib/format';
import { t } from '@/lib/i18n';

/** Practices with their contact attempts; practices with recent contact first. */
export function ContactsView() {
	const practices = usePractices();
	const attempts = useAttempts();
	if (!practices || !attempts) return <p className="muted">{t('common.loading')}</p>;

	const latest = new Map<string, string>();
	for (const attempt of attempts) {
		if (!latest.has(attempt.practiceId)) latest.set(attempt.practiceId, attempt.at);
	}
	const sorted = [...practices].sort((a, b) =>
		(latest.get(b.id) ?? b.createdAt).localeCompare(latest.get(a.id) ?? a.createdAt)
	);

	return (
		<>
			<details className="add-practice">
				<summary>{t('contacts.add')}</summary>
				<PracticeForm
					onSave={async (values) => {
						await createPractice(getDb(), values);
					}}
				/>
			</details>

			{sorted.length === 0 ? (
				<p>{t('contacts.empty')}</p>
			) : (
				<ul className="practice-list">
					{sorted.map((practice) => (
						<li key={practice.id}>
							<PracticeCard
								practice={practice}
								attempts={attempts
									.filter((attempt) => attempt.practiceId === practice.id)
									.sort((a, b) => a.at.localeCompare(b.at))}
							/>
						</li>
					))}
				</ul>
			)}
		</>
	);
}

type PracticeValues = Pick<
	Practice,
	'name' | 'kind' | 'phone' | 'phoneHours' | 'address' | 'notes'
>;

function PracticeForm({
	initial,
	onSave,
	onCancel
}: Readonly<{
	initial?: Practice;
	onSave: (values: PracticeValues) => Promise<void>;
	onCancel?: () => void;
}>) {
	const id = useId();
	const empty = { name: '', kind: 'kassenpraxis' as PracticeKind };
	const [values, setValues] = useState<PracticeValues>(initial ?? empty);
	const set = (field: keyof PracticeValues) => (event: { target: { value: string } }) =>
		setValues((current) => ({ ...current, [field]: event.target.value }));

	return (
		<form
			className="form"
			onSubmit={async (event) => {
				event.preventDefault();
				if (!values.name.trim()) return;
				await onSave({ ...values, name: values.name.trim() });
				if (!initial) setValues(empty);
			}}
		>
			<label htmlFor={`${id}-name`}>{t('contacts.name')}</label>
			<input id={`${id}-name`} value={values.name} onChange={set('name')} autoComplete="off" />

			<label htmlFor={`${id}-kind`}>{t('contacts.kind')}</label>
			<select id={`${id}-kind`} value={values.kind} onChange={set('kind')}>
				{PRACTICE_KINDS.map((kind) => (
					<option key={kind} value={kind}>
						{t(`kind.${kind}`)}
					</option>
				))}
			</select>

			<label htmlFor={`${id}-phone`}>{t('contacts.phone')}</label>
			<input
				id={`${id}-phone`}
				type="tel"
				value={values.phone ?? ''}
				onChange={set('phone')}
				autoComplete="off"
			/>

			<label htmlFor={`${id}-hours`}>{t('contacts.phoneHours')}</label>
			<input
				id={`${id}-hours`}
				value={values.phoneHours ?? ''}
				onChange={set('phoneHours')}
				placeholder={t('contacts.phoneHoursHint')}
			/>

			<label htmlFor={`${id}-address`}>{t('contacts.address')}</label>
			<input id={`${id}-address`} value={values.address ?? ''} onChange={set('address')} />

			<label htmlFor={`${id}-notes`}>{t('contacts.notes')}</label>
			<textarea id={`${id}-notes`} value={values.notes ?? ''} onChange={set('notes')} rows={2} />

			<div className="actions">
				<button type="submit" className="button button-primary">
					{t('common.save')}
				</button>
				{onCancel && (
					<button type="button" className="button" onClick={onCancel}>
						{t('common.cancel')}
					</button>
				)}
			</div>
		</form>
	);
}

function PracticeCard({
	practice,
	attempts
}: Readonly<{ practice: Practice; attempts: ContactAttempt[] }>) {
	const [editing, setEditing] = useState(false);
	const titleId = useId();

	return (
		<article className="card practice" aria-labelledby={titleId}>
			<h2 id={titleId}>{practice.name}</h2>
			{editing ? (
				<PracticeForm
					initial={practice}
					onCancel={() => setEditing(false)}
					onSave={async (values) => {
						await updatePractice(getDb(), practice.id, values);
						setEditing(false);
					}}
				/>
			) : (
				<>
					<p className="muted">{t(`kind.${practice.kind}`)}</p>
					{(practice.phone || practice.phoneHours || practice.address || practice.notes) && (
						<dl className="facts">
							{practice.phone && (
								<>
									<dt>{t('contacts.phone')}</dt>
									<dd>
										<a href={`tel:${practice.phone.replaceAll(/[^\d+]/g, '')}`}>{practice.phone}</a>
									</dd>
								</>
							)}
							{practice.phoneHours && (
								<>
									<dt>{t('contacts.phoneHours')}</dt>
									<dd>{practice.phoneHours}</dd>
								</>
							)}
							{practice.address && (
								<>
									<dt>{t('contacts.address')}</dt>
									<dd>{practice.address}</dd>
								</>
							)}
							{practice.notes && (
								<>
									<dt>{t('contacts.notes')}</dt>
									<dd>{practice.notes}</dd>
								</>
							)}
						</dl>
					)}
					<div className="actions">
						<button type="button" className="button" onClick={() => setEditing(true)}>
							{t('common.edit')}
						</button>
						<button
							type="button"
							className="button button-quiet"
							onClick={() => {
								if (globalThis.confirm(t('contacts.deletePracticeConfirm'))) {
									void deletePractice(getDb(), practice.id);
								}
							}}
						>
							{t('common.delete')}
						</button>
					</div>
				</>
			)}

			<h3>{t('contacts.attempts')}</h3>
			{attempts.length === 0 ? (
				<p className="muted">{t('contacts.noAttempts')}</p>
			) : (
				<ol className="attempts">
					{attempts.map((attempt) => (
						<li key={attempt.id}>
							<AttemptRow attempt={attempt} />
						</li>
					))}
				</ol>
			)}
		</article>
	);
}

function AttemptRow({ attempt }: Readonly<{ attempt: ContactAttempt }>) {
	const [editing, setEditing] = useState(false);
	const id = useId();
	const [at, setAt] = useState(toDateTimeLocal(attempt.at));
	const [result, setResult] = useState<ContactResult>(attempt.result);
	const [channel, setChannel] = useState<ContactChannel>(attempt.channel);
	const [weeks, setWeeks] = useState(attempt.waitTimeWeeks?.toString() ?? '');
	const [notes, setNotes] = useState(attempt.notes ?? '');

	if (!editing) {
		return (
			<div className="attempt">
				<p>
					<time dateTime={attempt.at}>{formatDateTime(attempt.at)}</time>
					{' · '}
					<strong>{t(`result.${attempt.result}`)}</strong>
					{attempt.waitTimeWeeks ? ` · ${formatWaitTime(attempt.waitTimeWeeks)}` : ''}
				</p>
				{(attempt.notes || attempt.rawInput) && (
					<p className="muted">{attempt.notes || attempt.rawInput}</p>
				)}
				<button
					type="button"
					className="button button-quiet"
					onClick={() => setEditing(true)}
					aria-label={`${t('contacts.editAttempt')}: ${formatDateTime(attempt.at)}`}
				>
					{t('common.edit')}
				</button>
			</div>
		);
	}

	return (
		<form
			className="form"
			aria-label={t('contacts.editAttempt')}
			onSubmit={async (event) => {
				event.preventDefault();
				await updateAttempt(getDb(), attempt.id, {
					at: fromDateTimeLocal(at) ?? attempt.at,
					result,
					channel,
					waitTimeWeeks: weeks === '' ? undefined : Number(weeks),
					notes: notes.trim() || undefined
				});
				setEditing(false);
			}}
		>
			<label htmlFor={`${id}-at`}>{t('capture.date')}</label>
			<input
				id={`${id}-at`}
				type="datetime-local"
				value={at}
				onChange={(event) => setAt(event.target.value)}
			/>
			<label htmlFor={`${id}-result`}>{t('capture.result')}</label>
			<select
				id={`${id}-result`}
				value={result}
				onChange={(event) => setResult(event.target.value as ContactResult)}
			>
				{CONTACT_RESULTS.map((option) => (
					<option key={option} value={option}>
						{t(`result.${option}`)}
					</option>
				))}
			</select>
			<label htmlFor={`${id}-channel`}>{t('contacts.channel')}</label>
			<select
				id={`${id}-channel`}
				value={channel}
				onChange={(event) => setChannel(event.target.value as ContactChannel)}
			>
				{CONTACT_CHANNELS.map((option) => (
					<option key={option} value={option}>
						{t(`channel.${option}`)}
					</option>
				))}
			</select>
			<label htmlFor={`${id}-weeks`}>{t('capture.weeksInput')}</label>
			<input
				id={`${id}-weeks`}
				type="number"
				inputMode="numeric"
				min={0}
				max={520}
				value={weeks}
				onChange={(event) => setWeeks(event.target.value)}
			/>
			<label htmlFor={`${id}-notes`}>{t('contacts.notes')}</label>
			<textarea
				id={`${id}-notes`}
				value={notes}
				onChange={(event) => setNotes(event.target.value)}
				rows={2}
			/>
			<div className="actions">
				<button type="submit" className="button button-primary">
					{t('common.save')}
				</button>
				<button type="button" className="button" onClick={() => setEditing(false)}>
					{t('common.cancel')}
				</button>
				<button
					type="button"
					className="button button-quiet"
					onClick={() => {
						if (globalThis.confirm(t('contacts.deleteAttemptConfirm'))) {
							void deleteAttempt(getDb(), attempt.id);
						}
					}}
				>
					{t('common.delete')}
				</button>
			</div>
		</form>
	);
}
