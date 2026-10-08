import { MainNav } from '@/components/MainNav';
import { QuickCapture } from '@/components/QuickCapture';
import { SiteHeader } from '@/components/SiteHeader';

/** The app itself: header, navigation and the "Kontakt notieren" button on every page. */
export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<SiteHeader home="/app/" />
			<MainNav />
			<main>{children}</main>
			<QuickCapture />
		</>
	);
}
