'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The installed app skips the start page and opens the app directly. The manifest's
 * start_url already does that; this covers home screen shortcuts made from the start page.
 */
export function StandaloneRedirect({ to }: Readonly<{ to: string }>) {
	const router = useRouter();
	useEffect(() => {
		const standalone =
			globalThis.matchMedia?.('(display-mode: standalone)').matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		if (standalone) router.replace(to);
	}, [router, to]);
	return null;
}
