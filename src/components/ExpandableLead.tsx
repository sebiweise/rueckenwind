'use client';

import { useId, useState } from 'react';
import { t } from '@/lib/i18n';

/** Texts up to this length are short enough to show in full right away. */
const SHORT = 180;

/** The short text of a stage: three lines first, the rest on request. */
export function ExpandableLead({ text }: Readonly<{ text: string }>) {
	const [open, setOpen] = useState(false);
	const id = useId();
	if (text.length <= SHORT) return <p className="lead">{text}</p>;

	return (
		<>
			<p id={id} className={open ? 'lead' : 'lead lead-clamped'}>
				{text}
			</p>
			<button
				type="button"
				className="button button-quiet lead-toggle"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen((value) => !value)}
			>
				{open ? t('content.readLess') : t('content.readMore')}
			</button>
		</>
	);
}
