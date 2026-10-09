import type { Metadata } from 'next';
import Link from 'next/link';
import {
	ChevronRightIcon,
	DownloadIcon,
	FlowerIcon,
	HeartIcon,
	HomeScreenIcon,
	InfoIcon,
	WindIcon
} from '@/components/Icons';
import { ThemePicker } from '@/components/ThemePicker';
import { APP_NAME } from '@/lib/config';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: `${t('more.title')} – ${APP_NAME}` };

const HELP = [
	{ href: '/krise/', label: t('nav.crisis'), icon: <HeartIcon />, quiet: true },
	{ href: '/hilfen/', label: t('nav.helpers'), icon: <FlowerIcon /> },
	{ href: '/installieren/', label: t('install.title'), icon: <HomeScreenIcon /> },
	{ href: '/hinweis/', label: t('footer.disclaimer'), icon: <InfoIcon /> },
	{ href: '/ueber/', label: t('nav.about'), icon: <WindIcon /> }
];

function Row({
	href,
	label,
	icon,
	quiet = false
}: Readonly<{ href: string; label: string; icon: React.ReactNode; quiet?: boolean }>) {
	return (
		<li>
			<Link href={href} className={quiet ? 'row row-quiet' : 'row'}>
				<span className="row-icon">{icon}</span>
				<span className="row-text">{label}</span>
				<ChevronRightIcon className="icon row-chevron" />
			</Link>
		</li>
	);
}

export default function MorePage() {
	return (
		<>
			<header className="page-head">
				<h1>{t('more.title')}</h1>
			</header>
			<section aria-labelledby="more-help">
				<h2 id="more-help" className="group-title">
					{t('more.help')}
				</h2>
				<ul className="rows">
					{HELP.map((link) => (
						<Row key={link.href} {...link} />
					))}
				</ul>
			</section>
			<ThemePicker />
			<section aria-labelledby="more-data">
				<h2 id="more-data" className="group-title">
					{t('data.groupTitle')}
				</h2>
				<ul className="rows">
					<Row href="/daten/#daten" label={t('more.data')} icon={<DownloadIcon />} />
				</ul>
			</section>
		</>
	);
}
