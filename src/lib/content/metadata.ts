import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import type { ContentPage } from './schema';

/** Title and description of a content page, shared by all pages built from content/de. */
export function contentMetadata(page: Pick<ContentPage, 'title' | 'summary'>): Metadata {
	return { title: `${page.title} – ${APP_NAME}`, description: page.summary };
}
