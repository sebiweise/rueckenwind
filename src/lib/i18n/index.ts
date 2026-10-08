import de from './de.json';

export type MessageKey = keyof typeof de;

const messages: Record<MessageKey, string> = de;

/** Returns the UI text for `key`. UI texts live in the JSON files, never in components. */
export function t(key: MessageKey): string {
	return messages[key];
}
