import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Dates in snapshots (PDF layout) must not depend on the machine's time zone.
process.env.TZ = 'UTC';

export default defineConfig({
	resolve: {
		alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
	},
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			include: ['src/lib/**/*.ts'],
			exclude: ['src/lib/**/*.spec.ts', 'src/lib/**/index.ts'],
			thresholds: {
				'src/lib/domain/**': { statements: 90, branches: 90, functions: 90, lines: 90 }
			}
		}
	}
});
