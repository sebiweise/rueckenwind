import { z } from 'zod';
import { STAGES } from '@/lib/domain';

const stepSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/, 'step ids are kebab-case'),
	title: z.string().min(1),
	/** "capture": the task is about a contact, so the app offers to note it right away. */
	action: z.literal('capture').optional()
});

/** A source is a bare URL or a URL with a readable title. */
const sourceSchema = z
	.union([z.url(), z.object({ url: z.url(), title: z.string().min(1) })])
	.transform((entry) => describeSource(typeof entry === 'string' ? { url: entry } : entry));

export interface ContentSource {
	url: string;
	/** Readable title from the frontmatter, if given. */
	title?: string;
	/** Host name without "www.", e.g. "therapie.de". */
	site: string;
	pdf: boolean;
}

export function describeSource({ url, title }: { url: string; title?: string }): ContentSource {
	const parsed = new URL(url);
	return {
		url,
		...(title ? { title } : {}),
		site: parsed.hostname.replace(/^www\./, ''),
		pdf: /\.pdf$/i.test(parsed.pathname)
	};
}

export const frontmatterSchema = z.object({
	title: z.string().min(1),
	stage: z.union(STAGES.map((stage) => z.literal(stage))).optional(),
	summary: z.string().min(1),
	lastReviewed: z.iso.date(),
	sources: z.array(sourceSchema).min(1),
	steps: z.array(stepSchema).optional()
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type ContentStep = z.infer<typeof stepSchema> & { stage: NonNullable<Frontmatter['stage']> };

export interface ContentSection {
	heading: string;
	html: string;
}

export interface ContentPage extends Omit<Frontmatter, 'steps'> {
	slug: string;
	/** Text before the first "##" heading, rendered as HTML (may be empty). */
	introHtml: string;
	sections: ContentSection[];
	steps: ContentStep[];
}
