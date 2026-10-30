import { ContentBody, ContentView } from '@/components/ContentView';
import { contentMetadata, loadOptionalPage, loadPage } from '@/lib/content';

const page = loadPage('ueber');
// Whoever hosts a public instance can add content/de/impressum.md.
const imprint = loadOptionalPage('impressum');

export const metadata = contentMetadata(page);

export default function AboutPage() {
	return (
		<>
			<ContentView page={page} />
			{imprint && (
				<section id="impressum" className="content" aria-labelledby="impressum-title">
					<h2 id="impressum-title">{imprint.title}</h2>
					<ContentBody page={imprint} level={3} />
				</section>
			)}
		</>
	);
}
