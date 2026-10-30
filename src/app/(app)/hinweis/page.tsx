import { ContentView } from '@/components/ContentView';
import { contentMetadata, loadPage } from '@/lib/content';

const page = loadPage('hinweis');

export const metadata = contentMetadata(page);

export default function Page() {
	return <ContentView page={page} />;
}
