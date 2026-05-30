import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:4321';
const isLocal = BASE_URL.startsWith('http://localhost');

const baseConfig = {
  testDir: './tests/playwright',
  outputDir: './tests/playwright/evidences',
  reporter: [
    ['list'] as const,
    ['json', { outputFile: './tests/playwright/reports/results.json' }] as const,
    ['html', { outputFolder: './tests/playwright/reports/html', open: 'never' as const }] as const,
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry' as const,
  },
  projects: [
    {
      name: 'chromium-mobile-375x667',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'chromium-tablet-768x1024',
      use: { ...devices['iPad Mini'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'chromium-desktop-1280x800',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'chromium-fhd-1920x1080',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit-1280x800',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
    },
  ],
};

export default isLocal
  ? defineConfig({
      ...baseConfig,
      webServer: {
        command: 'pnpm build && pnpm preview --port 4321',
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 60_000,
      },
    })
  : defineConfig(baseConfig);
