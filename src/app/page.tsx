import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { SiteHeader } from '@/components/SiteHeader';
import { StandaloneRedirect } from '@/components/StandaloneRedirect';
import { APP_NAME, APP_SUBTITLE } from '@/lib/config';
import { loadStages } from '@/lib/content';
import { t, type MessageKey } from '@/lib/i18n';

const SUPPORT: { title: MessageKey; text: MessageKey }[] = [
	{ title: 'start.captureTitle', text: 'start.captureText' },
	{ title: 'start.proofTitle', text: 'start.proofText' },
	{ title: 'start.rejectionsTitle', text: 'start.rejectionsText' }
];

const STEPS: MessageKey[] = ['start.step1', 'start.step2', 'start.step3'];

/** Start page: a short introduction before the app. The app itself lives at /app/. */
export default function StartPage() {
	const stages = loadStages();

	return (
		<>
			<StandaloneRedirect to="/app/" />
			<SiteHeader home="/" />
			<main className="start">
				<section className="start-hero" aria-labelledby="start-title">
					<Logo />
					<h1 id="start-title">
						{APP_NAME} <span className="subtitle">{APP_SUBTITLE}</span>
					</h1>
					<p className="lead">{t('start.lead')}</p>
					<p className="muted">{t('start.audience')}</p>
					<p className="start-cta">
						<Link href="/app/" className="button button-primary">
							{t('start.cta')}
						</Link>
						<span className="muted">{t('start.ctaHint')}</span>
					</p>
				</section>

				<section aria-labelledby="start-support">
					<h2 id="start-support">{t('start.supportTitle')}</h2>
					<div className="start-grid">
						<div className="card">
							<h3>{t('start.wayTitle')}</h3>
							<p>{t('start.wayText')}</p>
							<ol className="start-stages">
								{stages.map((stage) => (
									<li key={stage.stage}>{stage.title}</li>
								))}
							</ol>
						</div>
						{SUPPORT.map((item) => (
							<div key={item.title} className="card">
								<h3>{t(item.title)}</h3>
								<p>{t(item.text)}</p>
							</div>
						))}
					</div>
				</section>

				<section aria-labelledby="start-steps">
					<h2 id="start-steps">{t('start.stepsTitle')}</h2>
					<ol className="start-steps">
						{STEPS.map((step) => (
							<li key={step}>{t(step)}</li>
						))}
					</ol>
					<div className="card next-task">
						<h3>{t('start.installTitle')}</h3>
						<p>{t('start.installText')}</p>
						<p>
							<Link href="/installieren/">{t('start.installLink')}</Link>
						</p>
					</div>
				</section>

				<section aria-labelledby="start-privacy">
					<h2 id="start-privacy">{t('start.privacyTitle')}</h2>
					<p>{t('home.promise')}</p>
				</section>

				<p className="start-cta">
					<Link href="/app/" className="button button-primary">
						{t('start.cta')}
					</Link>
				</p>
			</main>
		</>
	);
}
