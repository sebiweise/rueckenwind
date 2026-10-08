import type { ContentPage } from '@/lib/content';
import { t } from '@/lib/i18n';
import { ReviewNotice } from './ReviewNotice';

const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'UTC' });

interface Props {
	page: ContentPage;
	/** Stage pages fold their sections away; other pages show everything. */
	collapsible?: boolean;
	eyebrow?: string;
}

/** Renders a page from content/de: title, short text, details, review date and sources. */
export function ContentView({ page, collapsible = false, eyebrow }: Readonly<Props>) {
	return (
		<article className="content">
			{eyebrow && <p className="eyebrow">{eyebrow}</p>}
			<h1>{page.title}</h1>
			<p className="lead">{page.summary}</p>
			{page.introHtml && <div dangerouslySetInnerHTML={{ __html: page.introHtml }} />}

			{collapsible ? (
				<div className="details-list">
					{page.sections.map((section) => (
						<details key={section.heading}>
							<summary>{section.heading}</summary>
							<div dangerouslySetInnerHTML={{ __html: section.html }} />
						</details>
					))}
				</div>
			) : (
				page.sections.map((section) => (
					<section key={section.heading}>
						<h2>{section.heading}</h2>
						<div dangerouslySetInnerHTML={{ __html: section.html }} />
					</section>
				))
			)}

			<footer className="content-meta">
				<ReviewNotice lastReviewed={page.lastReviewed} />
				<p>
					{t('content.lastReviewed', {
						date: dateFormat.format(new Date(`${page.lastReviewed}T00:00:00Z`))
					})}
				</p>
				<details>
					<summary>{t('content.sources')}</summary>
					<ul>
						{page.sources.map((source) => (
							<li key={source}>
								<a href={source} rel="noopener noreferrer" target="_blank">
									{new URL(source).hostname.replace(/^www\./, '')}
								</a>
							</li>
						))}
					</ul>
				</details>
			</footer>
		</article>
	);
}
