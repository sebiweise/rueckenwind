import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { escapeAttribute, isSafeUrl, sanitizeHtml } from './sanitize';
import { frontmatterSchema, type ContentPage, type ContentSection } from './schema';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Encodes a link target like marked does; null when it cannot be encoded. */
function encodeUrl(href: string): string | null {
	try {
		return encodeURI(href).replaceAll('%25', '%');
	} catch {
		return null;
	}
}

const marked = new Marked({
	gfm: true,
	async: false,
	renderer: {
		// Raw HTML in the Markdown: only a few harmless tags survive, see sanitize.ts.
		html({ text }) {
			return sanitizeHtml(text);
		},
		// Only web, mail, phone and in-app links. External links open in a new tab and send no referrer.
		link({ href, title, tokens }) {
			const text = this.parser.parseInline(tokens);
			const url = encodeUrl(href);
			if (url === null || !isSafeUrl(href)) return text;
			const external = /^(https?:)?\/\//i.test(href);
			return (
				`<a href="${escapeAttribute(url)}"` +
				(external ? ' rel="noopener noreferrer" target="_blank"' : '') +
				(title ? ` title="${escapeAttribute(title)}"` : '') +
				`>${text}</a>`
			);
		},
		// Images only from the app itself: the CSP blocks other origins anyway.
		image({ href, title, text }) {
			const url = encodeUrl(href);
			if (url === null || !isSafeUrl(href) || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
				return escapeAttribute(text);
			}
			return (
				`<img src="${escapeAttribute(url)}" alt="${escapeAttribute(text)}"` +
				(title ? ` title="${escapeAttribute(title)}"` : '') +
				'>'
			);
		}
	}
});

function toHtml(markdown: string): string {
	return marked.parse(markdown) as string;
}

/**
 * Turns one Markdown file with frontmatter into a page. Throws with the file
 * name on invalid frontmatter, so a broken content file fails the build.
 */
export function renderContent(slug: string, source: string): ContentPage {
	const match = FRONTMATTER.exec(source);
	if (!match) throw new Error(`content/${slug}.md: frontmatter missing`);
	const parsed = frontmatterSchema.safeParse(parseYaml(match[1]));
	if (!parsed.success) {
		throw new Error(`content/${slug}.md: ${parsed.error.message}`);
	}
	const { steps = [], ...frontmatter } = parsed.data;
	if (steps.length > 0 && frontmatter.stage === undefined) {
		throw new Error(`content/${slug}.md: steps need a stage`);
	}

	// HTML comments are review notes for content authors, not for readers.
	const body = source.slice(match[0].length).replaceAll(/<!--[\s\S]*?-->/g, '');
	const [intro, ...rest] = body.split(/^## /m);
	const sections: ContentSection[] = rest.map((chunk) => {
		const newline = chunk.indexOf('\n');
		const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
		const text = newline === -1 ? '' : chunk.slice(newline + 1);
		return { heading, html: toHtml(text).trim() };
	});

	return {
		...frontmatter,
		slug,
		introHtml: toHtml(intro).trim(),
		sections,
		steps: steps.map((step) => ({ ...step, stage: frontmatter.stage! }))
	};
}
