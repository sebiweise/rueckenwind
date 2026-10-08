import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { HeartIcon } from '@/components/Icons';
import { Logo } from '@/components/Logo';
import { MainNav } from '@/components/MainNav';
import { QuickCapture } from '@/components/QuickCapture';
import { ServiceWorker } from '@/components/ServiceWorker';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { contentSecurityPolicy } from '@/lib/csp';
import { t } from '@/lib/i18n';
import { paletteScript } from '@/lib/theme';
// Self-hosted rounded font for the Himmel theme; browsers only load it when it is used.
import '@fontsource-variable/nunito/wght.css';
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
		{ media: '(prefers-color-scheme: light)', color: '#fcf3ee' },
		{ media: '(prefers-color-scheme: dark)', color: '#1e1716' }
	]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		// The palette script may set data-palette before React hydrates.
		<html lang="de" suppressHydrationWarning>
			<head>
				{/* Production builds get this tag with script hashes from scripts/postbuild.mjs. */}
				{process.env.NODE_ENV === 'development' && (
					<meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy(true)} />
				)}
				{/* Applies the stored colour theme before the first paint. */}
				<script dangerouslySetInnerHTML={{ __html: paletteScript }} />
			</head>
			<body>
				<div className="shell">
					<header className="site-header">
						<Link href="/" className="brand">
							<Logo />
							{APP_NAME}
						</Link>
						<Link href="/krise/" className="crisis-button">
							<HeartIcon />
							{t('nav.crisisShort')}
						</Link>
					</header>
					<MainNav />
					<main>{children}</main>
					<footer className="site-footer">
						<p>
							<Link href="/hinweis/">{t('footer.disclaimer')}</Link>
						</p>
						<p>
							<Link href="/hilfen/">{t('nav.helpers')}</Link>
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
