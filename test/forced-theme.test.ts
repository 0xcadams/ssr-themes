import {test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkServerRenderedTheme,
  checkStoredTheme,
  gotoHome,
  makeBrowserContext,
  storedThemeValue,
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
      const colorScheme =
        storedTheme === 'dark' ? 'dark' : 'light';
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          colorScheme,
          cookies: [
            {
              name: 'theme',
              value: storedThemeValue(
                storedTheme as 'dark' | 'light',
                colorScheme,
              ),
            },
          ],
        },
      );
      const page = await context.newPage();
      await page.goto(pageUrl);

      await checkStoredTheme(
        page,
        storedThemeValue(
          storedTheme as 'dark' | 'light',
          colorScheme,
        ),
      );
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
      colorScheme: 'light',
      cookies: [
        {
          name: 'theme',
          value: storedThemeValue('light', 'light'),
        },
      ],
    });
    const page = await context.newPage();

    await page.goto('/dark');

    await checkStoredTheme(
      page,
      storedThemeValue('light', 'light'),
    );
    await checkAppliedTheme(page, 'dark');

    await gotoHome(page);

    await checkSelectedTheme(page, 'light');
    await checkStoredTheme(
      page,
      storedThemeValue('light', 'light'),
    );
    await checkAppliedTheme(page, 'light');
  });

  test('should server render the forced theme without javascript', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      baseURL,
      colorScheme: 'light',
      cookies: [
        {
          name: 'theme',
          value: storedThemeValue('light', 'light'),
        },
      ],
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/dark');

    await checkServerRenderedTheme(page, 'dark');
  });
});
