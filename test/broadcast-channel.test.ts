import {expect, test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkStoredTheme,
  gotoHome,
  makeBrowserContext,
  selectTheme,
  supportsForcedRoutes,
} from './util';

test.describe('cross-tab sync via BroadcastChannel', () => {
  test('syncs a theme change from one tab to another', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL,
      cookies: [{name: 'theme', value: 'light'}],
    });

    const page1 = await context.newPage();
    await gotoHome(page1);
    await checkSelectedTheme(page1, 'light');
    await checkStoredTheme(page1, 'light');
    await checkAppliedTheme(page1, 'light');

    const page2 = await context.newPage();
    await gotoHome(page2);
    await checkSelectedTheme(page2, 'light');
    await checkStoredTheme(page2, 'light');
    await checkAppliedTheme(page2, 'light');

    await selectTheme(page2, 'dark');

    await checkSelectedTheme(page2, 'dark');
    await checkStoredTheme(page2, 'dark');
    await checkAppliedTheme(page2, 'dark');

    await checkSelectedTheme(page1, 'dark');
    await checkStoredTheme(page1, 'dark');
    await checkAppliedTheme(page1, 'dark');
  });

  test('syncs switching back to system across tabs', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'dark',
      baseURL,
      cookies: [{name: 'theme', value: 'light'}],
    });

    const page1 = await context.newPage();
    await gotoHome(page1);
    await checkSelectedTheme(page1, 'light');
    await checkStoredTheme(page1, 'light');
    await checkAppliedTheme(page1, 'light');

    const page2 = await context.newPage();
    await gotoHome(page2);
    await checkSelectedTheme(page2, 'light');
    await checkStoredTheme(page2, 'light');
    await checkAppliedTheme(page2, 'light');

    await selectTheme(page2, 'system');

    await checkSelectedTheme(page2, 'system');
    await checkStoredTheme(page2, '~d');
    await checkAppliedTheme(page2, 'dark');

    await checkSelectedTheme(page1, 'system');
    await checkStoredTheme(page1, '~d');
    await checkAppliedTheme(page1, 'dark');
  });

  test('applies a queued theme change after leaving a forced-theme route', async ({
    browser,
    baseURL,
  }) => {
    test.skip(
      !supportsForcedRoutes,
      'Forced routes are not available in this example.',
    );

    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL,
      cookies: [{name: 'theme', value: 'dark'}],
    });

    const page1 = await context.newPage();
    await gotoHome(page1);
    await checkSelectedTheme(page1, 'dark');
    await checkAppliedTheme(page1, 'dark');

    const page2 = await context.newPage();
    await page2.goto('/dark');
    await checkAppliedTheme(page2, 'dark');

    await selectTheme(page1, 'light');
    await checkSelectedTheme(page1, 'light');
    await checkStoredTheme(page1, 'light');
    await checkAppliedTheme(page1, 'light');

    await checkAppliedTheme(page2, 'dark');
    await checkStoredTheme(page2, 'light');

    await page2.goto('/');
    await gotoHome(page2);

    expect(page2.url()).toBe(baseURL + '/');
    await checkSelectedTheme(page2, 'light');
    await checkStoredTheme(page2, 'light');
    await checkAppliedTheme(page2, 'light');
  });
});
