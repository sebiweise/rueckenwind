import de from './de.json';

export type MessageKey = keyof typeof de;

const messages: Record<MessageKey, string> = de;

/**
 * Returns the UI text for `key`. UI texts live in the JSON files, never in components.
 * Placeholders like `{count}` are filled from `values`.
 */
export function t(key: MessageKey, values?: Record<string, string | number>): string {
	const message = messages[key];
	if (!values) return message;
	return message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		name in values ? String(values[name]) : placeholder
	);
}
