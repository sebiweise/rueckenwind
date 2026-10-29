import { defineConfig, devices } from '@playwright/test';

const port = 4173;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.{ts,js}',
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${port}/`,
		// Optional: use an already installed Chromium instead of `npx playwright install`.
		...(process.env.PLAYWRIGHT_CHROMIUM_PATH && {
			launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
		})
	},
	projects: [
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }
	],
	webServer: {
		command: 'npm run build && npm start',
		port,
		env: { PORT: String(port) }
	}
});
