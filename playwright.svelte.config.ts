import {
  PlaywrightTestConfig,
  devices,
} from '@playwright/test';

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  testDir: './test',
  webServer: {
    command:
      'bun --filter @ssr-themes/svelte-example build && bun --filter @ssr-themes/svelte-example preview:e2e',
    port: 4042,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:4042',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
};

export default config;
