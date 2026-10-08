import type { Metadata, Viewport } from 'next';
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
						<span className="brand">{APP_NAME}</span>
					</header>
					<main>{children}</main>
					<footer className="site-footer">
						<p>{t('footer.disclaimer')}</p>
					</footer>
				</div>
			</body>
		</html>
	);
}
