import { describe, expect, it } from 'vitest';
import { STAGES } from '@/lib/domain';
import { loadOptionalPage, loadPage, loadStage, loadStages, loadSteps } from './load';
import { renderContent } from './render';
import { isSafeUrl, sanitizeHtml } from './sanitize';
import { describeSource } from './schema';

describe('content files', () => {
	const stages = loadStages();

	it('has exactly one page per stage', () => {
		expect(stages.map((page) => page.stage)).toEqual([...STAGES]);
	});

	it.each(['krise', 'hinweis', 'ueber', 'hilfen'])('has the page "%s"', (slug) => {
		const page = loadPage(slug);
		expect(page.title).not.toBe('');
		expect(page.sources.length).toBeGreaterThan(0);
	});

	it.each(stages.map((page) => [page.slug, page] as const))('%s is complete', (_, page) => {
		expect(page.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(page.sources.length).toBeGreaterThan(0);
		expect(page.sections.length).toBeGreaterThan(0);
		expect(page.steps.length).toBeGreaterThan(0);
		// Short text: at most about five sentences.
		const sentences = page.summary.split(/[.!?](\s|$)/).filter((s) => s.trim().length > 1);
		expect(sentences.length).toBeLessThanOrEqual(5);
	});

	it('uses unique step ids', () => {
		const ids = loadSteps().map((step) => step.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('keeps reviewer notes out of the rendered pages', () => {
		for (const page of stages) {
			const html = page.introHtml + page.sections.map((s) => s.html).join('');
			expect(html).not.toContain('TODO');
		}
	});

	it('uses no raw HTML that the filter would show as text', () => {
		for (const page of [...stages, ...['krise', 'hinweis', 'ueber', 'hilfen'].map(loadPage)]) {
			const html = page.introHtml + page.sections.map((s) => s.html).join('');
			expect(html, page.slug).not.toContain('&lt;');
			expect(html, page.slug).not.toMatch(/<(script|style|iframe|object|embed|form)\b/i);
		}
	});

	it('contains the crisis numbers', () => {
		const html = loadPage('krise')
			.sections.map((s) => s.html)
			.join('');
		for (const number of ['tel:112', 'tel:08001110111', 'tel:08001110222']) {
			expect(html).toContain(number);
		}
	});

	it('links helpers externally only, opening in a new tab', () => {
		const html = loadPage('hilfen')
			.sections.map((s) => s.html)
			.join('');
		expect(html).toContain(
			'<a href="https://hdsunflower.com/" rel="noopener noreferrer" target="_blank"'
		);
		expect(html).not.toMatch(/<(img|script|iframe)\b/);
		expect(html).not.toContain('TODO');
	});

	it('loads one stage and treats a missing optional page as absent', () => {
		expect(loadStage(2).title).toBe('Sprechstunde');
		expect(loadOptionalPage('gibt-es-nicht')).toBeNull();
		expect(loadOptionalPage('krise')?.slug).toBe('krise');
	});
});

describe('renderContent', () => {
	const valid = [
		'---',
		'title: Test',
		'stage: 3',
		'summary: Kurz.',
		'lastReviewed: 2026-10-08',
		'sources: [https://example.org]',
		'steps: [{ id: a-b, title: Tu etwas. }]',
		'---',
		'Intro mit [Link](https://example.org).',
		'',
		'## Erster Abschnitt',
		'',
		'Text <!-- TODO: fachlich prüfen -->',
		'## Leer'
	].join('\n');

	it('splits intro and sections and drops comments', () => {
		const page = renderContent('test', valid);
		expect(page.introHtml).toContain('rel="noopener noreferrer"');
		expect(page.sections.map((s) => s.heading)).toEqual(['Erster Abschnitt', 'Leer']);
		expect(page.sections[0].html).toBe('<p>Text </p>');
		expect(page.sections[1].html).toBe('');
		expect(page.steps).toEqual([{ id: 'a-b', title: 'Tu etwas.', stage: 3 }]);
	});

	it('accepts sources with and without a title', () => {
		const page = renderContent(
			'test',
			valid.replace(
				'sources: [https://example.org]',
				'sources: [https://www.example.org/a.pdf, { url: https://example.org/b, title: Bericht }]'
			)
		);
		expect(page.sources).toEqual([
			{ url: 'https://www.example.org/a.pdf', site: 'example.org', pdf: true },
			{ url: 'https://example.org/b', title: 'Bericht', site: 'example.org', pdf: false }
		]);
	});

	it.each([
		['no frontmatter', 'Nur Text', 'frontmatter missing'],
		['a bad date', valid.replace('2026-10-08', '8.10.2026'), 'lastReviewed'],
		['no sources', valid.replace('sources: [https://example.org]', 'sources: []'), 'sources'],
		[
			'a source without url',
			valid.replace('sources: [https://example.org]', 'sources: [{ title: Ohne Link }]'),
			'sources'
		],
		['a bad stage', valid.replace('stage: 3', 'stage: 9'), 'stage'],
		['steps without stage', valid.replace('stage: 3\n', ''), 'steps need a stage'],
		['a bad step id', valid.replace('id: a-b', 'id: A B'), 'kebab-case']
	])('fails on %s', (_, source, message) => {
		expect(() => renderContent('test', source)).toThrow(message);
	});
});

describe('HTML in content', () => {
	const render = (markdown: string) =>
		renderContent(
			'test',
			[
				'---',
				'title: Test',
				'summary: Kurz.',
				'lastReviewed: 2026-10-08',
				'sources: [https://example.org]',
				'---',
				markdown
			].join('\n')
		).introHtml;

	it('keeps harmless tags for text', () => {
		expect(render('Die <abbr title="Terminservicestelle">TSS</abbr> hilft.<br>Weiter.')).toBe(
			'<p>Die <abbr title="Terminservicestelle">TSS</abbr> hilft.<br>Weiter.</p>'
		);
		expect(render('<details>\n<summary>Mehr</summary>\n\nText\n</details>')).toContain(
			'<details>\n<summary>Mehr</summary>'
		);
	});

	it('shows every other tag as text', () => {
		const html = render(
			[
				'<script>alert(1)</script>',
				'',
				'Text <img src=x onerror=alert(1)> und <iframe src="https://example.org"></iframe>',
				'',
				'<a href="javascript:alert(1)">Klick</a> <style>p{}</style>'
			].join('\n')
		);
		expect(html).not.toMatch(/<(script|img|iframe|a|style)\b/i);
		expect(html).toContain('&lt;script>');
	});

	it('drops attributes that are not allowed', () => {
		expect(render('<abbr title="x" onclick="alert(1)" style="color:red">A</abbr>')).toBe(
			'<p><abbr title="x">A</abbr></p>'
		);
	});

	it('allows only safe link targets and marks external links', () => {
		expect(render('[Web](https://example.org/?a=1&b=2 "Titel")')).toBe(
			'<p><a href="https://example.org/?a=1&amp;b=2" rel="noopener noreferrer" target="_blank" title="Titel">Web</a></p>'
		);
		expect(render('[Krise](/krise/) [Notruf](tel:112) [Mail](mailto:a@example.org)')).toBe(
			'<p><a href="/krise/">Krise</a> <a href="tel:112">Notruf</a> <a href="mailto:a@example.org">Mail</a></p>'
		);
		for (const href of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x']) {
			expect(render(`[Böse](${href})`)).toBe('<p>Böse</p>');
		}
	});

	it('shows images only from the app itself', () => {
		expect(render('![Logo](/icons/icon.svg)')).toBe(
			'<p><img src="/icons/icon.svg" alt="Logo"></p>'
		);
		expect(render('![Fremd](https://example.org/a.png)')).toBe('<p>Fremd</p>');
	});
});

describe('isSafeUrl', () => {
	it.each([
		['https://example.org', true],
		['/krise/', true],
		['#abschnitt', true],
		['tel:112', true],
		['javascript:alert(1)', false],
		['java\tscript:alert(1)', false],
		[' javascript:alert(1)', false],
		['vbscript:x', false]
	])('%j → %s', (href, safe) => {
		expect(isSafeUrl(href)).toBe(safe);
	});
});

describe('sanitizeHtml', () => {
	it('leaves text and entities alone and escapes stray brackets', () => {
		expect(sanitizeHtml('a &amp; b < c > d')).toBe('a &amp; b &lt; c > d');
		expect(sanitizeHtml('<B>fett</B><br/>')).toBe('<b>fett</b><br />');
	});
});

describe('describeSource', () => {
	it('reads the site from the URL and spots PDFs', () => {
		expect(describeSource({ url: 'https://www.therapie.de/x/' })).toEqual({
			url: 'https://www.therapie.de/x/',
			site: 'therapie.de',
			pdf: false
		});
		expect(describeSource({ url: 'https://a.de/F.PDF', title: 'Faltblatt' })).toMatchObject({
			title: 'Faltblatt',
			pdf: true
		});
	});
});
