'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import type { ContactAttempt, JourneyState, Practice } from '@/lib/domain';
import { getDb } from './db';
import { getJourney, listAttempts, listPractices } from './repository';

const inBrowser = () => typeof indexedDB !== 'undefined';

/** All practices, live. `undefined` while loading (and during prerendering). */
export function usePractices(): Practice[] | undefined {
	return useLiveQuery(() => (inBrowser() ? listPractices(getDb()) : undefined), []);
}

/** All attempts, newest first, live. */
export function useAttempts(): ContactAttempt[] | undefined {
	return useLiveQuery(() => (inBrowser() ? listAttempts(getDb()) : undefined), []);
}

/** The journey state, live. */
export function useJourney(): JourneyState | undefined {
	return useLiveQuery(() => (inBrowser() ? getJourney(getDb()) : undefined), []);
}
