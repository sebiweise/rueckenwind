import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { contentSecurityPolicy } from '@/lib/csp';
import { t } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
	title: APP_TITLE,
	description: t('meta.description'),
	referrer: 'no-referrer'
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	colorScheme: 'light dark'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="de">
			<head>
				<meta
					httpEquiv="Content-Security-Policy"
					content={contentSecurityPolicy(process.env.NODE_ENV === 'development')}
				/>
			</head>
			<body>
				<div className="shell">
					<header className="site-header">
						<Link href="/" className="brand">
							{APP_NAME}
						</Link>
						<Link href="/krise/" className="crisis-button">
							{t('nav.crisisShort')}
						</Link>
					</header>
					<main>{children}</main>
					<footer className="site-footer">
						<p>
							<Link href="/hinweis/">{t('footer.disclaimer')}</Link>
						</p>
						<p>
							<Link href="/ueber/">{t('nav.about')}</Link>
						</p>
					</footer>
				</div>
			</body>
		</html>
	);
}
