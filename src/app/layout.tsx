import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { QuickCapture } from '@/components/QuickCapture';
import { ServiceWorker } from '@/components/ServiceWorker';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { contentSecurityPolicy } from '@/lib/csp';
import { t } from '@/lib/i18n';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
	title: APP_TITLE,
	description: t('meta.description'),
	referrer: 'no-referrer',
	applicationName: APP_NAME,
	appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'default' },
	icons: {
		icon: [{ url: `${basePath}/icons/icon.svg`, type: 'image/svg+xml' }],
		apple: `${basePath}/icons/apple-touch-icon.png`
	}
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	colorScheme: 'light dark',
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#fbf8f4' },
		{ media: '(prefers-color-scheme: dark)', color: '#1c1a18' }
	]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="de">
			<head>
				{/* Production builds get this tag with script hashes from scripts/postbuild.mjs. */}
				{process.env.NODE_ENV === 'development' && (
					<meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy(true)} />
				)}
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
					<nav className="main-nav" aria-label={t('nav.main')}>
						<Link href="/">{t('nav.home')}</Link>
						<Link href="/kontakte/">{t('nav.contacts')}</Link>
						<Link href="/daten/">{t('nav.data')}</Link>
					</nav>
					<main>{children}</main>
					<footer className="site-footer">
						<p>
							<Link href="/hinweis/">{t('footer.disclaimer')}</Link>
						</p>
						<p>
							<Link href="/ueber/">{t('nav.about')}</Link>
						</p>
					</footer>
					<QuickCapture />
					<ServiceWorker />
				</div>
			</body>
		</html>
	);
}
