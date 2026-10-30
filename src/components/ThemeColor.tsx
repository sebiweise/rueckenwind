'use client';

import { useEffect } from 'react';
import { applyThemeColor, currentPalette } from '@/lib/theme';

/**
 * Colours the browser chrome like the stored palette. The page itself already has the
 * palette from the inline script in <head>; the theme-color tags follow after hydration.
 */
export function ThemeColor() {
	useEffect(() => {
		applyThemeColor(currentPalette(document.documentElement), document);
	}, []);
	return null;
}
