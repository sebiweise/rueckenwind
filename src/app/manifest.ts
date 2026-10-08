import type { MetadataRoute } from 'next';
import { APP_NAME, APP_TITLE } from '@/lib/config';
import { t } from '@/lib/i18n';

export const dynamic = 'force-static';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: APP_TITLE,
		short_name: APP_NAME,
		description: t('meta.description'),
		lang: 'de',
		dir: 'ltr',
		start_url: `${basePath}/`,
		scope: `${basePath}/`,
		display: 'standalone',
		background_color: '#fcf3ee',
		theme_color: '#3d6b57',
		icons: [
			{ src: `${basePath}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
			{ src: `${basePath}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
			{
				src: `${basePath}/icons/maskable-512.png`,
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable'
			},
			{ src: `${basePath}/icons/icon.svg`, sizes: 'any', type: 'image/svg+xml' }
		]
	};
}
