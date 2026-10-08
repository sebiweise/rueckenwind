import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { frontmatterSchema, type ContentPage, type ContentSection } from './schema';

const marked = new Marked({ gfm: true, async: false });

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function toHtml(markdown: string): string {
	const html = marked.parse(markdown) as string;
	// External links open in a new tab and send no referrer.
	return html.replace(
		/<a href="(https?:[^"]+)"/g,
		'<a href="$1" rel="noopener noreferrer" target="_blank"'
	);
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

	// Comments are notes for reviewers ("TODO: fachlich prüfen"), not for readers.
	const body = source.slice(match[0].length).replace(/<!--[\s\S]*?-->/g, '');
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
