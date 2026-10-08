'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocumentIcon, MoreIcon, PathIcon, PeopleIcon } from '@/components/Icons';
import { t } from '@/lib/i18n';
import { sectionOf, type Section } from '@/lib/navigation';

/**
 * Main navigation. On phones a bar at the bottom, with a gap in the middle for the
 * "Kontakt notieren" button; on wider screens a row of links below the header.
 */
export function MainNav() {
	const section = sectionOf(usePathname() ?? '/app/');

	function item(key: Section, href: string, label: string, icon: React.ReactNode) {
		return (
			<Link href={href} className="nav-link" aria-current={section === key ? 'page' : undefined}>
				{icon}
				<span>{label}</span>
			</Link>
		);
	}

	return (
		<nav className="main-nav" aria-label={t('nav.main')}>
			{item('home', '/app/', t('nav.homeShort'), <PathIcon />)}
			{item('contacts', '/kontakte/', t('nav.contacts'), <PeopleIcon />)}
			<span className="nav-gap" aria-hidden="true" />
			{item('data', '/daten/', t('nav.dataShort'), <DocumentIcon />)}
			{item('more', '/mehr/', t('nav.more'), <MoreIcon />)}
		</nav>
	);
}
