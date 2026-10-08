'use client';

import { useSyncExternalStore } from 'react';
import { isReviewOverdue } from '@/lib/domain';
import { t } from '@/lib/i18n';

const noSubscription = () => () => {};

/** Shows a calm hint when a page was not reviewed for twelve months, judged on the reader's date. */
export function ReviewNotice({ lastReviewed }: { lastReviewed: string }) {
	const overdue = useSyncExternalStore(
		noSubscription,
		() => isReviewOverdue(lastReviewed),
		() => false
	);
	if (!overdue) return null;
	return (
		<p className="notice" role="note">
			{t('content.reviewOverdue')}
		</p>
	);
}
