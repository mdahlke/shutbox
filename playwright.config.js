import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	expect: { timeout: 5_000 },
	fullyParallel: false,
	retries: 0,
	use: {
		baseURL: 'http://localhost:5174',
		headless: true,
		viewport: { width: 1280, height: 800 },
	},
	webServer: {
		command: 'npm run dev -- --port 5174',
		port: 5174,
		reuseExistingServer: true,
		timeout: 15_000,
	},
});
