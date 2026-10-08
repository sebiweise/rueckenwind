import type { Metadata } from 'next';
import { ContentView } from '@/components/ContentView';
import { APP_NAME } from '@/lib/config';
import { loadOptionalPage, loadPage } from '@/lib/content';

const page = loadPage('ueber');
// Whoever hosts a public instance can add content/de/impressum.md.
const imprint = loadOptionalPage('impressum');

export const metadata: Metadata = {
	title: `${page.title} – ${APP_NAME}`,
	description: page.summary
};

export default function AboutPage() {
	return (
		<>
			<ContentView page={page} />
			{imprint && (
				<section id="impressum" className="content">
					<h2>{imprint.title}</h2>
					<div dangerouslySetInnerHTML={{ __html: imprint.introHtml }} />
					{imprint.sections.map((section) => (
						<div key={section.heading}>
							<h3>{section.heading}</h3>
							<div dangerouslySetInnerHTML={{ __html: section.html }} />
						</div>
					))}
				</section>
			)}
		</>
	);
}
