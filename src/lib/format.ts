import { t } from '@/lib/i18n';

const dateTime = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
const date = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' });

/** "8. Okt. 2026, 09:30" in the reader's time zone. */
export function formatDateTime(iso: string): string {
	return dateTime.format(new Date(iso));
}

/** "8. Okt. 2026" in the reader's time zone. */
export function formatDate(iso: string): string {
	return date.format(new Date(iso));
}

/** Value for <input type="datetime-local"> in local time, e.g. "2026-10-08T09:30". */
export function toDateTimeLocal(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Reads <input type="datetime-local"> back into ISO 8601; null when empty or invalid. */
export function fromDateTimeLocal(value: string): string | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Waiting time in words: weeks up to two months, then months, then years. */
export function formatWaitTime(weeks: number): string {
	if (weeks === 1) return t('wait.week');
	if (weeks < 9) return t('wait.weeks', { count: weeks });
	const months = Math.round((weeks * 12) / 52);
	if (months < 18) return t('wait.months', { count: months });
	const years = Math.round((weeks / 52) * 2) / 2;
	return years === 1 ? t('wait.year') : t('wait.years', { count: String(years).replace('.', ',') });
}
