import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	APP_NAME,
	APP_SUBTITLE,
	APP_TITLE,
	DEFAULT_FEEDBACK_URL,
	feedbackEndpoint
} from './config';

it('builds the title from name and subtitle', () => {
	expect(APP_TITLE).toBe(`${APP_NAME} – ${APP_SUBTITLE}`);
});

describe('feedbackEndpoint', () => {
	it('defaults to the central feedback service', () => {
		expect(feedbackEndpoint(undefined)?.href).toBe(
			`${DEFAULT_FEEDBACK_URL}/v1/feedback/rueckenwind`
		);
	});

	it('keeps a path of the base URL and drops trailing slashes', () => {
		expect(feedbackEndpoint('https://example.org/feedback//')?.href).toBe(
			'https://example.org/feedback/v1/feedback/rueckenwind'
		);
		expect(feedbackEndpoint('http://127.0.0.1:8787')?.href).toBe(
			'http://127.0.0.1:8787/v1/feedback/rueckenwind'
		);
	});

	it('is switched off by an empty value', () => {
		expect(feedbackEndpoint('')).toBeNull();
	});

	it('refuses plain http outside a local test server', () => {
		expect(() => feedbackEndpoint('http://example.org')).toThrow(/https/);
		expect(() => feedbackEndpoint('javascript:alert(1)')).toThrow(/https/);
	});
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
