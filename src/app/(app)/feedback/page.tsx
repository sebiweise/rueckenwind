import type { Metadata } from 'next';
import Link from 'next/link';
import { FeedbackForm } from '@/components/FeedbackForm';
import { APP_NAME, FEEDBACK_ENDPOINT } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('feedback.title')} – ${APP_NAME}` };

/** The one place where something leaves the device, and only on purpose. */
export default function FeedbackPage() {
	return (
		<>
			<header className="page-head">
				<h1>{t('feedback.title')}</h1>
				{FEEDBACK_ENDPOINT && <p className="muted">{t('feedback.lead')}</p>}
			</header>
			{/* Without a service nothing is sent, so there is no data flow to describe. */}
			{FEEDBACK_ENDPOINT && (
				<section aria-labelledby="feedback-privacy">
					<h2 id="feedback-privacy" className="group-title">
						{t('feedback.privacyTitle')}
					</h2>
					<ul className="feedback-privacy">
						<li>{t('feedback.privacyOnly')}</li>
						<li>{t('feedback.privacyNoHealth')}</li>
						<li>{t('feedback.privacyRoute')}</li>
						<li>{t('feedback.privacyEmail')}</li>
						<li>
							<Link href="/ueber/">{t('feedback.privacyMore')}</Link>
						</li>
					</ul>
				</section>
			)}
			<FeedbackForm />
		</>
	);
}
