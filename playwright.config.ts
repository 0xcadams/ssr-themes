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
    command: 'bun --filter @ssr-themes/next dev',
    port: 4041,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:4041',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
};

export default config;
