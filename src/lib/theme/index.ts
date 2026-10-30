/**
 * Colour themes. The palettes themselves live in globals.css (`:root[data-palette=…]`);
 * this module only knows their names and how the choice is stored on this device.
 */
export const PALETTES = ['salbei', 'pfirsich', 'himmel'] as const;
export type Palette = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: Palette = 'salbei';

/**
 * Background of each palette for the browser chrome (`<meta name="theme-color">`).
 * They must match `--color-bg` (light and dark) in globals.css.
 */
export const PALETTE_THEME_COLORS: Readonly<Record<Palette, { light: string; dark: string }>> = {
	salbei: { light: '#fcf3ee', dark: '#1e1716' },
	pfirsich: { light: '#fcf3ee', dark: '#1c1418' },
	himmel: { light: '#eff3fa', dark: '#131726' }
};

/**
 * Colours of the default palette for the first paint and the web app manifest.
 * `accent` must match `--color-accent` in globals.css.
 */
export const DEFAULT_THEME_COLORS = {
	...PALETTE_THEME_COLORS[DEFAULT_PALETTE],
	accent: '#3d6b57'
} as const;

/** localStorage key. A display preference only, no health data. */
export const PALETTE_STORAGE_KEY = 'rueckenwind.palette';

export function isPalette(value: unknown): value is Palette {
	return typeof value === 'string' && (PALETTES as readonly string[]).includes(value);
}

/**
 * Inline script for <head>: applies the stored palette before the first paint, so the page
 * does not flash in the default colours. Its text must stay constant, because the CSP
 * allows it by hash (scripts/postbuild.mjs).
 */
export const paletteScript = `try{var p=localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)});if(${JSON.stringify(PALETTES.filter((p) => p !== DEFAULT_PALETTE))}.indexOf(p)>-1)document.documentElement.dataset.palette=p}catch(e){}`;

/** Applies `palette` to the page and remembers it on this device. */
export function applyPalette(palette: Palette, root: HTMLElement, storage?: Storage): void {
	if (palette === DEFAULT_PALETTE) delete root.dataset.palette;
	else root.dataset.palette = palette;
	try {
		if (palette === DEFAULT_PALETTE) storage?.removeItem(PALETTE_STORAGE_KEY);
		else storage?.setItem(PALETTE_STORAGE_KEY, palette);
	} catch {
		// Storage can be blocked (private mode); the choice then lasts for this page only.
	}
}

/**
 * Colours the browser chrome (address bar, status bar of the installed app) like the
 * chosen palette. Updates the light and the dark `<meta name="theme-color">` from the layout.
 */
export function applyThemeColor(palette: Palette, doc: Pick<Document, 'querySelectorAll'>): void {
	const colors = PALETTE_THEME_COLORS[palette];
	for (const meta of doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
		const dark = meta.media.includes('dark');
		meta.content = dark ? colors.dark : colors.light;
	}
}

/** The palette currently shown on the page. */
export function currentPalette(root: HTMLElement): Palette {
	return isPalette(root.dataset.palette) ? root.dataset.palette : DEFAULT_PALETTE;
}
