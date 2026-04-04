import {test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkServerRenderedTheme,
  checkStoredTheme,
  gotoHome,
  makeBrowserContext,
  supportsForcedRoutes,
} from './util';

test.describe('forced theme test-suite', () => {
  test.skip(
    !supportsForcedRoutes,
    'Forced routes are not available in this example.',
  );

  function makeForcedThemeTest(
    pageUrl: string,
    storedTheme: string,
    expectedTheme: string,
  ) {
    test(`should render forced-theme (${expectedTheme}) instead of stored theme (${storedTheme})`, async ({
      browser,
      baseURL,
    }) => {
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          cookies: [
            {name: 'theme', value: storedTheme},
          ],
        },
      );
      const page = await context.newPage();
      await page.goto(pageUrl);

      await checkStoredTheme(page, storedTheme);
      await checkAppliedTheme(page, expectedTheme);
    });
  }

  makeForcedThemeTest('/light', 'dark', 'light');
  makeForcedThemeTest('/dark', 'light', 'dark');

  test('should restore the stored theme after leaving a forced route', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      baseURL,
      cookies: [{name: 'theme', value: 'light'}],
    });
    const page = await context.newPage();

    await page.goto('/dark');

    await checkStoredTheme(page, 'light');
    await checkAppliedTheme(page, 'dark');

    await gotoHome(page);

    await checkSelectedTheme(page, 'light');
    await checkStoredTheme(page, 'light');
    await checkAppliedTheme(page, 'light');
  });

  test('should server render the forced theme without javascript', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      baseURL,
      cookies: [{name: 'theme', value: 'light'}],
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/dark');

    await checkServerRenderedTheme(page, 'dark');
  });
});
