import type { ContentPage } from '@/lib/content';
import { t } from '@/lib/i18n';
import { CheckCircleIcon, ChevronIcon, ExternalIcon, PlusIcon } from './Icons';
import { ExpandableLead } from './ExpandableLead';
import { ReviewNotice } from './ReviewNotice';

const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'UTC' });

interface Props {
	page: ContentPage;
	/** Stage pages fold their sections away; other pages show everything. */
	collapsible?: boolean;
	eyebrow?: string;
	/** Shown above the eyebrow, e.g. the stage dots. */
	header?: React.ReactNode;
	/** Shown right after the short text, e.g. the tasks of a stage. */
	children?: React.ReactNode;
}

/** Renders a page from content/de: title, short text, details, review date and sources. */
export function ContentView({
	page,
	collapsible = false,
	eyebrow,
	header,
	children
}: Readonly<Props>) {
	return (
		<article className="content">
			{header}
			{eyebrow && <p className="eyebrow">{eyebrow}</p>}
			<h1>{page.title}</h1>
			{collapsible ? (
				<ExpandableLead text={page.summary} />
			) : (
				<p className="lead">{page.summary}</p>
			)}
			{children}
			<ContentBody page={page} collapsible={collapsible} />

			<footer className="content-meta">
				<ReviewNotice lastReviewed={page.lastReviewed} />
				<div className="meta-card">
					<p className="meta-reviewed">
						<CheckCircleIcon />
						{t('content.lastReviewed', {
							date: dateFormat.format(new Date(`${page.lastReviewed}T00:00:00Z`))
						})}
					</p>
					<details className="sources">
						<summary>
							<span>{t('content.sources')}</span>
							<span className="sources-count" aria-hidden="true">
								{page.sources.length}
							</span>
							<ChevronIcon className="icon chevron" />
						</summary>
						<p className="sources-intro">{t('content.sourcesIntro')}</p>
						<ul className="source-list">
							{page.sources.map((source) => (
								<li key={source.url}>
									<a href={source.url} rel="noopener noreferrer" target="_blank">
										<span className="source-text">
											<span className="source-title">{source.title ?? source.site}</span>
											{(source.title || source.pdf) && (
												<span className="source-site">
													{[source.title && source.site, source.pdf && t('content.sourcePdf')]
														.filter(Boolean)
														.join(' · ')}
												</span>
											)}
										</span>
										<ExternalIcon />
										<span className="visually-hidden">{t('content.newTab')}</span>
									</a>
								</li>
							))}
						</ul>
					</details>
				</div>
			</footer>
		</article>
	);
}

interface BodyProps {
	page: Pick<ContentPage, 'introHtml' | 'sections'>;
	collapsible?: boolean;
	/** Heading level of the sections, e.g. 3 when the page is part of another page. */
	level?: 2 | 3;
}

/**
 * The rendered text of a page: intro and sections. The HTML comes from
 * content/de at build time and is sanitized in lib/content/render.ts.
 */
export function ContentBody({ page, collapsible = false, level = 2 }: Readonly<BodyProps>) {
	const Heading = level === 2 ? 'h2' : 'h3';
	return (
		<>
			{page.introHtml && <div dangerouslySetInnerHTML={{ __html: page.introHtml }} />}

			{collapsible
				? page.sections.length > 0 && (
						<section aria-labelledby="details-title">
							<Heading id="details-title">{t('content.details')}</Heading>
							<div className="details-list">
								{page.sections.map((section) => (
									<details key={section.heading}>
										<summary>
											<span>{section.heading}</span>
											<PlusIcon className="icon details-icon" />
										</summary>
										<div dangerouslySetInnerHTML={{ __html: section.html }} />
									</details>
								))}
							</div>
						</section>
					)
				: page.sections.map((section) => (
						<section key={section.heading}>
							<Heading>{section.heading}</Heading>
							<div dangerouslySetInnerHTML={{ __html: section.html }} />
						</section>
					))}
		</>
	);
}
