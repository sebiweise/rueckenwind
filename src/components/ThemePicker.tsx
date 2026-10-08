'use client';

import { useId, useSyncExternalStore } from 'react';
import { t } from '@/lib/i18n';
import { applyPalette, currentPalette, DEFAULT_PALETTE, PALETTES, type Palette } from '@/lib/theme';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function choose(palette: Palette) {
	applyPalette(palette, document.documentElement, globalThis.localStorage);
	listeners.forEach((listener) => listener());
}

/** Lets the user pick one of the colour themes. Stored only on this device. */
export function ThemePicker() {
	const id = useId();
	const palette = useSyncExternalStore(
		subscribe,
		() => currentPalette(document.documentElement),
		() => DEFAULT_PALETTE
	);

	return (
		<section className="card" aria-labelledby={`${id}-title`}>
			<h2 id={`${id}-title`}>{t('theme.title')}</h2>
			<p>{t('theme.lead')}</p>
			<fieldset className="palette-options">
				<legend className="visually-hidden">{t('theme.title')}</legend>
				{PALETTES.map((name) => (
					<label key={name} className="palette-option">
						<input
							type="radio"
							name={`${id}-palette`}
							value={name}
							checked={palette === name}
							onChange={() => choose(name)}
						/>
						<span className="palette-text">
							<span className="palette-name">{t(`theme.${name}`)}</span>
							<span className="muted">{t(`theme.${name}Text`)}</span>
						</span>
						<span className="palette-swatches" data-palette={name} aria-hidden="true">
							<span />
							<span />
							<span />
						</span>
					</label>
				))}
			</fieldset>
		</section>
	);
}
