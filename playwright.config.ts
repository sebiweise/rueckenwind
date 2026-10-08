import { defineConfig, devices } from '@playwright/test';

// E2E_TARGET=static tests the static export, otherwise the standalone server is tested.
const target = process.env.E2E_TARGET === 'static' ? 'static' : 'standalone';
const port = 4173;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.{ts,js}',
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: `http://localhost:${port}/` },
	projects: [
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }
	],
	webServer: {
		command:
			target === 'static'
				? 'npm run build:static && npm run preview:static'
				: 'npm run build && npm start',
		port,
		env: { PORT: String(port), HOSTNAME: 'localhost' }
	}
});
