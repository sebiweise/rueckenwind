import type { Metadata } from 'next';
import { ContentView } from '@/components/ContentView';
import { APP_NAME } from '@/lib/config';
import { loadPage } from '@/lib/content';

const page = loadPage('hinweis');

export const metadata: Metadata = {
	title: `${page.title} – ${APP_NAME}`,
	description: page.summary
};

export default function Page() {
	return <ContentView page={page} />;
}
