import { afterEach, describe, expect, it, vi } from 'vitest';
import { APP_NAME, APP_SUBTITLE, APP_TITLE } from './config';

it('builds the title from name and subtitle', () => {
	expect(APP_TITLE).toBe(`${APP_NAME} – ${APP_SUBTITLE}`);
});

/** Loads config.ts again, because BASE_PATH is read once when the module loads. */
async function loadConfig(basePath: string) {
	vi.resetModules();
	vi.stubEnv('NEXT_PUBLIC_BASE_PATH', basePath);
	return import('./config');
}

describe('withBasePath', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('leaves URLs unchanged at the root of a domain', async () => {
		const { BASE_PATH, withBasePath } = await loadConfig('');
		expect(BASE_PATH).toBe('');
		expect(withBasePath('/sw.js')).toBe('/sw.js');
	});

	it('puts the base path in front of root-relative URLs only', async () => {
		const { withBasePath } = await loadConfig('/rueckenwind');
		expect(withBasePath('/')).toBe('/rueckenwind/');
		expect(withBasePath('/icons/icon.svg')).toBe('/rueckenwind/icons/icon.svg');
		for (const url of ['https://example.org/', '//example.org/', 'tel:112', '#daten', 'krise/']) {
			expect(withBasePath(url)).toBe(url);
		}
	});

	it('prefixes in-app links and images in content', async () => {
		vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/rueckenwind');
		vi.resetModules();
		const { renderContent } = await import('./content/render');
		const page = renderContent(
			'test',
			[
				'---',
				'title: Test',
				'summary: Kurz.',
				'lastReviewed: 2026-10-08',
				'sources: [https://example.org]',
				'---',
				'[Krise](/krise/) [Web](https://example.org/) ![Logo](/icons/icon.svg)'
			].join('\n')
		);
		expect(page.introHtml).toContain('<a href="/rueckenwind/krise/">');
		expect(page.introHtml).toContain('<a href="https://example.org/"');
		expect(page.introHtml).toContain('<img src="/rueckenwind/icons/icon.svg"');
	});
});
