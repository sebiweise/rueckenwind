import type { MetadataRoute } from 'next';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { t } from '@/lib/i18n';
import { DEFAULT_THEME_COLORS } from '@/lib/theme';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: APP_TITLE,
		short_name: APP_NAME,
		description: t('meta.description'),
		lang: 'de',
		dir: 'ltr',
		// Keeps installs from before the start page the same app; it once started at `/`.
		id: '/',
		// The installed app opens the app itself, not the start page.
		start_url: '/app/',
		scope: '/',
		display: 'standalone',
		background_color: DEFAULT_THEME_COLORS.light,
		theme_color: DEFAULT_THEME_COLORS.accent,
		icons: [
			{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
			{
				src: '/icons/maskable-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable'
			},
			{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }
		]
	};
}
