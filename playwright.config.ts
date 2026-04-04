import {
  PlaywrightTestConfig,
  devices,
} from '@playwright/test';

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  testDir: './test',
  use: {
    trace: 'on-first-retry',
    baseURL: remoteBaseURL ?? 'http://localhost:4041',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  ...(remoteBaseURL
    ? {}
    : {
        webServer: {
          command: 'bun --cwd examples/next dev',
          port: 4041,
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      }),
};

export default config;
