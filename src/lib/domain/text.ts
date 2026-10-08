/**
 * Folds German text into a simple comparison form: lower case, umlauts spelled
 * out (ä → ae, ö → oe, ü → ue, ß → ss), dashes unified, whitespace collapsed.
 * Keywords are written in this form, so "Rückruf" and "rueckruf" compare equal.
 */
export function fold(text: string): string {
	return text
		.toLowerCase()
		.replaceAll('ä', 'ae')
		.replaceAll('ö', 'oe')
		.replaceAll('ü', 'ue')
		.replaceAll('ß', 'ss')
		.replaceAll(/[–—]/g, '-')
		.replaceAll(/\s+/g, ' ')
		.trim();
}

/** First row and column of the distance table: the cost of building a prefix from nothing. */
function initialDistance(i: number, j: number): number {
	if (i === 0) return j;
	return j === 0 ? i : 0;
}

/**
 * Optimal string alignment distance: insertions, deletions, substitutions and
 * swaps of neighbouring letters each cost 1. Used to tolerate typos in keywords.
 */
export function editDistance(a: string, b: string): number {
	const rows = a.length + 1;
	const cols = b.length + 1;
	const d: number[][] = Array.from({ length: rows }, (_, i) =>
		Array.from({ length: cols }, (_, j) => initialDistance(i, j))
	);
	for (let i = 1; i < rows; i++) {
		for (let j = 1; j < cols; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
			}
		}
	}
	return d[a.length][b.length];
}
