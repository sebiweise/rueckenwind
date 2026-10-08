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
