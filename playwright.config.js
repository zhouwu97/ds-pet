import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', timeout: 30000, workers: 2, use: { baseURL: 'http://127.0.0.1:4175', viewport: { width: 1280, height: 900 } }, webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4175', reuseExistingServer: !process.env.CI } });
