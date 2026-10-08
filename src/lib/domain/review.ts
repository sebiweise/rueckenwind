/** Months after which a content page without review shows a hint. */
export const REVIEW_INTERVAL_MONTHS = 12;

/** True when `lastReviewed` (YYYY-MM-DD) lies more than twelve months before `now`. */
export function isReviewOverdue(
	lastReviewed: string,
	now: Date = new Date(),
	months = REVIEW_INTERVAL_MONTHS
): boolean {
	const reviewed = new Date(`${lastReviewed}T00:00:00`);
	if (Number.isNaN(reviewed.getTime())) return true;
	const due = new Date(reviewed);
	due.setMonth(due.getMonth() + months);
	return now.getTime() > due.getTime();
}
