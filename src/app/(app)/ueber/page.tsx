import { ContentBody, ContentView } from '@/components/ContentView';
import { FEEDBACK_ENDPOINT } from '@/lib/config';
import { contentMetadata, loadOptionalPage, loadPage } from '@/lib/content';

const page = loadPage('ueber');
// Whoever hosts a public instance can add content/de/impressum.md.
const imprint = loadOptionalPage('impressum');
// Only a build with a feedback service describes where feedback goes.
const feedback = FEEDBACK_ENDPOINT ? loadPage('feedback') : null;

export const metadata = contentMetadata(page);

export default function AboutPage() {
	return (
		<>
			<ContentView page={page} />
			{feedback && (
				<section id="feedback" className="content" aria-labelledby="feedback-title">
					<h2 id="feedback-title">{feedback.title}</h2>
					<ContentBody page={feedback} level={3} />
				</section>
			)}
			{imprint && (
				<section id="impressum" className="content" aria-labelledby="impressum-title">
					<h2 id="impressum-title">{imprint.title}</h2>
					<ContentBody page={imprint} level={3} />
				</section>
			)}
		</>
	);
}
