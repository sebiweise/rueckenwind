/**
 * Colour themes. The palettes themselves live in globals.css (`:root[data-palette=…]`);
 * this module only knows their names and how the choice is stored on this device.
 */
export const PALETTES = ['salbei', 'pfirsich', 'himmel'] as const;
export type Palette = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: Palette = 'salbei';

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

/** The palette currently shown on the page. */
export function currentPalette(root: HTMLElement): Palette {
	return isPalette(root.dataset.palette) ? root.dataset.palette : DEFAULT_PALETTE;
}
