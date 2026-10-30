/**
 * localStorage, or undefined when the browser blocks site data. Merely reading
 * `localStorage` then throws a SecurityError.
 */
export function readStorage(): Storage | undefined {
	try {
		return globalThis.localStorage;
	} catch {
		return undefined;
	}
}
