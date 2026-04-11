import {test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkStoredTheme,
  gotoHome,
  makeBrowserContext,
  selectTheme,
  storedThemeValue,
} from './util';

test.describe('cross-tab sync via BroadcastChannel', () => {
  test('syncs a theme change from one tab to another', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL,
      cookies: [
        {
          name: 'theme',
          value: storedThemeValue('light', 'light'),
        },
      ],
    });

    const page1 = await context.newPage();
    await gotoHome(page1);
    await checkSelectedTheme(page1, 'light');
    await checkStoredTheme(
      page1,
      storedThemeValue('light', 'light'),
    );
    await checkAppliedTheme(page1, 'light');

    const page2 = await context.newPage();
    await gotoHome(page2);
    await checkSelectedTheme(page2, 'light');
    await checkStoredTheme(
      page2,
      storedThemeValue('light', 'light'),
    );
    await checkAppliedTheme(page2, 'light');

    await selectTheme(page2, 'dark');

    await checkSelectedTheme(page2, 'dark');
    await checkStoredTheme(
      page2,
      storedThemeValue('dark', 'light'),
    );
    await checkAppliedTheme(page2, 'dark');

    await checkSelectedTheme(page1, 'dark');
    await checkStoredTheme(
      page1,
      storedThemeValue('dark', 'light'),
    );
    await checkAppliedTheme(page1, 'dark');
  });

  test('syncs switching back to system across tabs', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'dark',
      baseURL,
      cookies: [
        {
          name: 'theme',
          value: storedThemeValue('light', 'dark'),
        },
      ],
    });

    const page1 = await context.newPage();
    await gotoHome(page1);
    await checkSelectedTheme(page1, 'light');
    await checkStoredTheme(
      page1,
      storedThemeValue('light', 'dark'),
    );
    await checkAppliedTheme(page1, 'light');

    const page2 = await context.newPage();
    await gotoHome(page2);
    await checkSelectedTheme(page2, 'light');
    await checkStoredTheme(
      page2,
      storedThemeValue('light', 'dark'),
    );
    await checkAppliedTheme(page2, 'light');

    await selectTheme(page2, 'system');

    await checkSelectedTheme(page2, 'system');
    await checkStoredTheme(page2, '~d');
    await checkAppliedTheme(page2, 'dark');

    await checkSelectedTheme(page1, 'system');
    await checkStoredTheme(page1, '~d');
    await checkAppliedTheme(page1, 'dark');
  });
});
