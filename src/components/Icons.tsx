/** Small line icons for navigation and buttons. Decorative: always paired with a text label. */

interface IconProps {
	className?: string;
}

function Svg({ className, children }: Readonly<IconProps & { children: React.ReactNode }>) {
	return (
		<svg
			className={className ?? 'icon'}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{children}
		</svg>
	);
}

export function PathIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="6" cy="18" r="2.5" />
			<circle cx="18" cy="6" r="2.5" />
			<path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
		</Svg>
	);
}

export function PeopleIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="9" cy="8" r="3.5" />
			<path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
			<path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
		</Svg>
	);
}

export function DocumentIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
			<path d="M14 3v5h5M9 13h6M9 17h4" />
		</Svg>
	);
}

export function MoreIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="5" cy="12" r="1.2" />
			<circle cx="12" cy="12" r="1.2" />
			<circle cx="19" cy="12" r="1.2" />
		</Svg>
	);
}

export function PlusIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 5v14M5 12h14" />
		</Svg>
	);
}

export function HeartIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 20s-7.2-4.4-8.8-8.9C2 7.9 4.1 4.7 7.3 4.7c1.9 0 3.3 1 4.7 2.7 1.4-1.7 2.8-2.7 4.7-2.7 3.2 0 5.3 3.2 4.1 6.4C19.2 15.6 12 20 12 20z" />
		</Svg>
	);
}

export function CheckIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M5 12.5l4.5 4.5L19 7.5" />
		</Svg>
	);
}

export function ExternalIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M14 4h6v6M20 4l-9 9" />
			<path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
		</Svg>
	);
}

export function CheckCircleIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M8 12.5l2.7 2.7L16 9.8" />
		</Svg>
	);
}

export function ChevronIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M6 9l6 6 6-6" />
		</Svg>
	);
}

export function ChevronRightIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M9 6l6 6-6 6" />
		</Svg>
	);
}

export function ChevronLeftIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M15 6l-6 6 6 6" />
		</Svg>
	);
}

export function PhoneIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
		</Svg>
	);
}

export function ClockIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.5V12l3 2" />
		</Svg>
	);
}

export function CalendarIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<rect x="4" y="5" width="16" height="15" rx="3" />
			<path d="M4 10h16M9 3v4M15 3v4" />
		</Svg>
	);
}

export function CloseIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M7 7l10 10M17 7L7 17" />
		</Svg>
	);
}

export function ListIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
		</Svg>
	);
}

export function DownloadIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
		</Svg>
	);
}

export function UploadIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 15V4M7 9l5-5 5 5M5 20h14" />
		</Svg>
	);
}

export function TrashIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />
		</Svg>
	);
}

export function InfoIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 11v5M12 8h.01" />
		</Svg>
	);
}

export function FlowerIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<circle cx="12" cy="12" r="2.5" />
			<path d="M12 9.5a3 3 0 1 1 0-6 3 3 0 1 1 0 6M12 14.5a3 3 0 1 0 0 6 3 3 0 1 0 0-6M9.5 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0M14.5 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
		</Svg>
	);
}

export function WindIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" />
		</Svg>
	);
}

export function PaletteIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" />
			<circle cx="7.5" cy="11" r="1" />
			<circle cx="10" cy="7" r="1" />
			<circle cx="15" cy="7.5" r="1" />
		</Svg>
	);
}

export function ShareIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<path d="M12 15V3M8 7l4-4 4 4M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
		</Svg>
	);
}

export function HomeScreenIcon(props: Readonly<IconProps>) {
	return (
		<Svg {...props}>
			<rect x="6" y="2.5" width="12" height="19" rx="2.5" />
			<path d="M12 9v6M9 12h6M11 18.5h2" />
		</Svg>
	);
}
