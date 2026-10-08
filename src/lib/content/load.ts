import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { StageNumber } from '@/lib/domain';
import { renderContent } from './render';
import type { ContentPage, ContentStep } from './schema';

/**
 * Build-time only: reads content/de/*.md. Pages that use it are prerendered,
 * so neither the standalone server nor the static export reads files at runtime.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content', 'de');

export function loadPage(slug: string): ContentPage {
	return renderContent(slug, readFileSync(path.join(CONTENT_DIR, `${slug}.md`), 'utf8'));
}

/** An optional page, e.g. the imprint a host adds for their instance. */
export function loadOptionalPage(slug: string): ContentPage | null {
	return existsSync(path.join(CONTENT_DIR, `${slug}.md`)) ? loadPage(slug) : null;
}

/** The five stage pages, ordered by stage. */
export function loadStages(): ContentPage[] {
	return readdirSync(CONTENT_DIR)
		.filter((file) => /^etappe-\d+-.+\.md$/.test(file))
		.map((file) => loadPage(file.replace(/\.md$/, '')))
		.sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0));
}

export function loadStage(stage: StageNumber): ContentPage {
	const page = loadStages().find((candidate) => candidate.stage === stage);
	if (!page) throw new Error(`No content for stage ${stage}`);
	return page;
}

/** All steps of all stages, in order. */
export function loadSteps(): ContentStep[] {
	return loadStages().flatMap((page) => page.steps);
}
