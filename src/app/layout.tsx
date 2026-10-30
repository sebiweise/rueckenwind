import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ServiceWorker } from '@/components/ServiceWorker';
import { ThemeColor } from '@/components/ThemeColor';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { contentSecurityPolicy } from '@/lib/csp';
import { t } from '@/lib/i18n';
import { DEFAULT_THEME_COLORS, paletteScript } from '@/lib/theme';
// Self-hosted rounded font for the Himmel theme; browsers only load it when it is used.
import '@fontsource-variable/nunito/wght.css';
import './globals.css';

export const metadata: Metadata = {
	title: APP_TITLE,
	description: t('meta.description'),
	referrer: 'no-referrer',
	applicationName: APP_NAME,
	appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'default' },
	icons: {
		icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
		apple: '/icons/apple-touch-icon.png'
	}
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	colorScheme: 'light dark'
	// theme-color is rendered in <head> below: Next.js would reset the tags on every
	// navigation, and ThemeColor sets them to the chosen palette.
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
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content={DEFAULT_THEME_COLORS.light}
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content={DEFAULT_THEME_COLORS.dark}
				/>
				{/* Applies the stored colour theme before the first paint. */}
				<script dangerouslySetInnerHTML={{ __html: paletteScript }} />
			</head>
			<body>
				<div className="shell">
					{/* Header and main come from the start page or the app layout in (app)/. */}
					{children}
					<footer className="site-footer">
						<p>{t('footer.privacy')}</p>
						<p className="site-footer-links">
							<Link href="/hinweis/">{t('footer.disclaimer')}</Link>
							<Link href="/ueber/">{t('nav.about')}</Link>
						</p>
					</footer>
					<ServiceWorker />
					<ThemeColor />
				</div>
			</body>
		</html>
	);
}
