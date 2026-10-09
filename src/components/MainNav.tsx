'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocumentIcon, MoreIcon, PathIcon, PeopleIcon, PlusIcon } from '@/components/Icons';
import { openCapture } from '@/lib/capture';
import { t } from '@/lib/i18n';
import { sectionOf, type Section } from '@/lib/navigation';

/**
 * Main navigation. On phones a bar at the bottom with the round "Kontakt notieren"
 * button in the middle; on wider screens a row below the header with the button at the end.
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
			<button type="button" className="fab" onClick={() => openCapture()}>
				<PlusIcon />
				<span className="fab-label">{t('capture.open')}</span>
			</button>
			{item('data', '/daten/', t('nav.dataShort'), <DocumentIcon />)}
			{item('more', '/mehr/', t('nav.more'), <MoreIcon />)}
		</nav>
	);
}
