/** Opens the "Kontakt notieren" sheet from anywhere in the app, optionally with a first line. */
export const CAPTURE_EVENT = 'rueckenwind:capture';

export interface CaptureRequest {
	/** Text to start with, e.g. the practice name for another try. */
	text?: string;
}

export function openCapture(request: CaptureRequest = {}): void {
	globalThis.dispatchEvent(new CustomEvent<CaptureRequest>(CAPTURE_EVENT, { detail: request }));
}
