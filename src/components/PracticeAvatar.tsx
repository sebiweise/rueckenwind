import type { Practice } from '@/lib/domain';

/** Two letters for a practice ("Praxis Weber" → "PW"), the TSS gets its number. */
export function practiceInitials(practice: Pick<Practice, 'name' | 'kind'>): string {
	if (practice.kind === 'tss') return '116';
	const letters = practice.name
		.split(/\s+/)
		.map((word) => word.replaceAll(/[^\p{L}\d]/gu, '').charAt(0))
		.filter(Boolean);
	return letters.slice(0, 2).join('').toUpperCase() || '?';
}

/** A soft round tile with the initials. Decorative: the name always stands next to it. */
export function PracticeAvatar({
	practice
}: Readonly<{ practice: Pick<Practice, 'name' | 'kind'> }>) {
	return (
		<span className="avatar" aria-hidden="true">
			{practiceInitials(practice)}
		</span>
	);
}
