export type Section = 'home' | 'contacts' | 'data' | 'more';

/** Which navigation tab a page belongs to, so the tab stays marked on sub-pages. */
export function sectionOf(pathname: string): Section | null {
	const path = pathname.replace(/\/+$/, '') || '/';
	if (path === '/app' || path.startsWith('/etappe')) return 'home';
	if (path.startsWith('/kontakte')) return 'contacts';
	if (path.startsWith('/daten')) return 'data';
	if (
		['/mehr', '/hilfen', '/installieren', '/ueber', '/hinweis'].some((prefix) =>
			path.startsWith(prefix)
		)
	) {
		return 'more';
	}
	return null;
}
