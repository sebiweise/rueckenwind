import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from './csp';

describe('contentSecurityPolicy', () => {
	it('only allows the own origin in production', () => {
		const csp = contentSecurityPolicy(false);
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("connect-src 'self';");
		expect(csp).not.toMatch(/https?:/);
		expect(csp).not.toContain('unsafe-eval');
	});

	it('allows eval and websockets only in development', () => {
		const csp = contentSecurityPolicy(true);
		expect(csp).toContain("'unsafe-eval'");
		expect(csp).toContain("connect-src 'self' ws:");
	});
});

describe('contentSecurityPolicy with script hashes', () => {
	it('replaces unsafe-inline for scripts with the hashes', () => {
		const csp = contentSecurityPolicy(false, ['abc=', 'def=']);
		const scriptSrc = csp.split('; ').find((d) => d.startsWith('script-src'));
		expect(scriptSrc).toBe("script-src 'self' 'sha256-abc=' 'sha256-def='");
	});

	it('allows no inline scripts at all without hashes on the page', () => {
		const scriptSrc = contentSecurityPolicy(false, [])
			.split('; ')
			.find((d) => d.startsWith('script-src'));
		expect(scriptSrc).toBe("script-src 'self'");
	});
});
