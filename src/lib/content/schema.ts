import { z } from 'zod';
import { STAGES } from '@/lib/domain';

const stepSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/, 'step ids are kebab-case'),
	title: z.string().min(1)
});

export const frontmatterSchema = z.object({
	title: z.string().min(1),
	stage: z.union(STAGES.map((stage) => z.literal(stage))).optional(),
	summary: z.string().min(1),
	lastReviewed: z.iso.date(),
	sources: z.array(z.url()).min(1),
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
