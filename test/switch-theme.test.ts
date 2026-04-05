import {test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkStoredTheme,
  checkStoredThemeMissing,
  gotoHome,
  makeBrowserContext,
  selectTheme,
  usesExplicitLightDefault,
} from './util';

test.describe('basic theming test-suite', () => {
  function makeRenderThemeTest(
    theme: 'dark' | 'light',
  ) {
    test(`should render ${theme} theme`, async ({
      browser,
      baseURL,
    }) => {
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          cookies: [{name: 'theme', value: theme}],
        },
      );
      const page = await context.newPage();

      await gotoHome(page);

      await checkSelectedTheme(page, theme);
      await checkStoredTheme(page, theme);
      await checkAppliedTheme(page, theme);
    });
  }

  makeRenderThemeTest('light');
  makeRenderThemeTest('dark');

  function shouldUpdateTheme(
    initialTheme: 'dark' | 'light',
    targetTheme: 'dark' | 'light',
  ) {
    test(`should switch from ${initialTheme} to ${targetTheme}-theme`, async ({
      browser,
      baseURL,
    }) => {
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          cookies: [
            {name: 'theme', value: initialTheme},
          ],
        },
      );
      const page = await context.newPage();

      await gotoHome(page);

      await checkSelectedTheme(page, initialTheme);
      await checkStoredTheme(page, initialTheme);
      await checkAppliedTheme(page, initialTheme);

      await selectTheme(page, targetTheme);

      await checkSelectedTheme(page, targetTheme);
      await checkStoredTheme(page, targetTheme);
      await checkAppliedTheme(page, targetTheme);

      await page.reload();

      await checkSelectedTheme(page, targetTheme);
      await checkStoredTheme(page, targetTheme);
      await checkAppliedTheme(page, targetTheme);
    });
  }

  shouldUpdateTheme('light', 'dark');
  shouldUpdateTheme('dark', 'light');

  if (usesExplicitLightDefault) {
    test('should default to light without persisting a cookie', async ({
      browser,
      baseURL,
    }) => {
      const context = await makeBrowserContext(
        browser,
        {
          colorScheme: 'dark',
          baseURL,
        },
      );
      const page = await context.newPage();

      await gotoHome(page);

      await checkSelectedTheme(page, 'light');
      await checkStoredThemeMissing(page);
      await checkAppliedTheme(page, 'light');
    });
  } else {
    function makeDefaultSystemThemeTest(
      preferredColorScheme: 'light' | 'dark',
      expectedTheme: 'light' | 'dark',
    ) {
      test(`should default to system and persist ${expectedTheme} theme when preferred-colorscheme is ${preferredColorScheme}`, async ({
        browser,
        baseURL,
      }) => {
        const context = await makeBrowserContext(
          browser,
          {
            colorScheme: preferredColorScheme,
            baseURL,
          },
        );
        const page = await context.newPage();

        await gotoHome(page);

        await checkSelectedTheme(page, 'system');
        await checkStoredTheme(
          page,
          expectedTheme === 'dark' ? '~d' : '~l',
        );
        await checkAppliedTheme(page, expectedTheme);
      });
    }

    makeDefaultSystemThemeTest('light', 'light');
    makeDefaultSystemThemeTest('dark', 'dark');
  }

  test('should switch back to system and persist the resolved theme after reload', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL,
      cookies: [{name: 'theme', value: 'dark'}],
    });
    const page = await context.newPage();

    await gotoHome(page);

    await checkSelectedTheme(page, 'dark');
    await checkStoredTheme(page, 'dark');
    await checkAppliedTheme(page, 'dark');

    await selectTheme(page, 'system');

    await checkSelectedTheme(page, 'system');
    await checkStoredTheme(page, '~l');
    await checkAppliedTheme(page, 'light');

    await page.reload();

    await checkSelectedTheme(page, 'system');
    await checkStoredTheme(page, '~l');
    await checkAppliedTheme(page, 'light');
  });
});
