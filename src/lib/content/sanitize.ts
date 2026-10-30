/*
 * Build-time HTML filter for the Markdown in content/de. The content is
 * community-maintained, and its HTML goes straight into the page. Markdown
 * itself stays fully usable; raw HTML is limited to a few harmless tags for
 * text, every other tag is shown as text. No dependency, no runtime cost.
 */

/** Raw HTML tags that content may use, with the attributes each may keep. */
export const ALLOWED_TAGS: Readonly<Record<string, readonly string[]>> = {
	abbr: ['title'],
	b: [],
	br: [],
	dd: [],
	del: [],
	details: [],
	dl: [],
	dt: [],
	em: [],
	i: [],
	ins: [],
	kbd: [],
	mark: [],
	s: [],
	small: [],
	strong: [],
	sub: [],
	summary: [],
	sup: [],
	u: [],
	wbr: []
};

const TAG =
	/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Escapes a value for use inside a double-quoted HTML attribute. */
export function escapeAttribute(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

/** Rebuilds an allowed tag with only its allowed attributes, or returns null. */
function cleanTag(match: RegExpExecArray): string | null {
	const [, closing, rawName, rawAttributes, selfClosing] = match;
	const name = rawName.toLowerCase();
	const allowed = ALLOWED_TAGS[name];
	if (!allowed) return null;
	if (closing) return `</${name}>`;
	let attributes = '';
	for (const [, rawKey, double, single, bare] of rawAttributes.matchAll(ATTRIBUTE)) {
		const key = rawKey.toLowerCase();
		if (!allowed.includes(key)) continue;
		attributes += ` ${key}="${escapeAttribute(double ?? single ?? bare ?? '')}"`;
	}
	return `<${name}${attributes}${selfClosing ? ' /' : ''}>`;
}

/**
 * Keeps the allowed tags (with their allowed attributes) and turns every other
 * `<` into `&lt;`, so scripts, frames, styles, event handlers and links in raw
 * HTML never reach the page. Text and entities stay as they are.
 */
export function sanitizeHtml(html: string): string {
	let result = '';
	let index = 0;
	while (index < html.length) {
		const next = html.indexOf('<', index);
		if (next === -1) {
			result += html.slice(index);
			break;
		}
		result += html.slice(index, next);
		TAG.lastIndex = next;
		const match = TAG.exec(html);
		const tag = match && cleanTag(match);
		if (match && tag) {
			result += tag;
			index = next + match[0].length;
		} else {
			result += '&lt;';
			index = next + 1;
		}
	}
	return result;
}

/** Link targets content may use: web, mail, phone and links within the app. */
export function isSafeUrl(href: string): boolean {
	// Browsers ignore control characters and spaces in a scheme ("java\tscript:").
	const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href.replaceAll(/[\u0000- \u007f]/g, ''));
	return !scheme || ['http', 'https', 'mailto', 'tel'].includes(scheme[1].toLowerCase());
}
