/**
 * The Rückenwind mark: three soft wind lines in a circle.
 * Drawn with theme colours, so it follows the chosen palette. App icons: public/icons/*.svg.
 */
export function Logo() {
	return (
		<svg className="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
			<circle cx="16" cy="16" r="16" className="logo-bg" />
			<g fill="none" className="logo-lines" strokeWidth="2.4" strokeLinecap="round">
				<path d="M7 12.5c4.5-2.2 9 .8 13.5-.8 2.2-.8 2.6-3.4.6-4" />
				<path d="M6.5 17.5c6-1.6 11.5.9 18-.8" />
				<path d="M9.5 22.5c3.6-.9 7 .3 10.5-.6" />
			</g>
		</svg>
	);
}
