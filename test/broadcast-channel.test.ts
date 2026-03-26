import {test, expect} from '@playwright/test';
import {
  checkAppliedTheme,
  checkStoredTheme,
  makeBrowserContext,
} from './util';

test.describe('cross-tab sync via BroadcastChannel', () => {
  test('syncs a theme change from one tab to another', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL: baseURL,
      cookies: [{name: 'theme', value: 'light'}],
    });

    const page1 = await context.newPage();
    await page1.goto('/');
    await checkAppliedTheme(page1, 'light');

    const page2 = await context.newPage();
    await page2.goto('/');
    await checkAppliedTheme(page2, 'light');

    await page2
      .locator('[data-test-id="theme-selector"]')
      .selectOption('dark');

    await checkAppliedTheme(page2, 'dark');
    await checkAppliedTheme(page1, 'dark');
  });

  test('applies a queued theme change after leaving a forced-theme route', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL: baseURL,
      cookies: [{name: 'theme', value: 'dark'}],
    });

    const page1 = await context.newPage();
    await page1.goto('/');
    await checkAppliedTheme(page1, 'dark');

    const page2 = await context.newPage();
    await page2.goto('/dark');
    await checkAppliedTheme(page2, 'dark');

    await page1
      .locator('[data-test-id="theme-selector"]')
      .selectOption('light');
    await checkAppliedTheme(page1, 'light');

    await checkAppliedTheme(page2, 'dark');
    await checkStoredTheme(page2, 'light');

    await page2.locator('text=Go back home').click();
    await page2
      .locator('[data-test-id="theme-selector"]')
      .waitFor();

    expect(page2.url()).toBe(baseURL + '/');
    await checkAppliedTheme(page2, 'light');
  });
});
