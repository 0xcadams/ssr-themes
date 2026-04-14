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

test.describe('basic theming test-suite', () => {
  function makeRenderThemeTest(
    theme: 'dark' | 'light',
  ) {
    test(`should render ${theme} theme`, async ({
      browser,
      baseURL,
    }) => {
      const colorScheme = theme;
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          colorScheme,
          cookies: [
            {
              name: 'theme',
              value: storedThemeValue(
                theme,
                colorScheme,
              ),
            },
          ],
        },
      );
      const page = await context.newPage();

      await gotoHome(page);

      await checkSelectedTheme(page, theme);
      await checkStoredTheme(
        page,
        storedThemeValue(theme, colorScheme),
      );
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
      const colorScheme = 'light';
      const context = await makeBrowserContext(
        browser,
        {
          baseURL,
          colorScheme,
          cookies: [
            {
              name: 'theme',
              value: storedThemeValue(
                initialTheme,
                colorScheme,
              ),
            },
          ],
        },
      );
      const page = await context.newPage();

      await gotoHome(page);

      await checkSelectedTheme(page, initialTheme);
      await checkStoredTheme(
        page,
        storedThemeValue(initialTheme, colorScheme),
      );
      await checkAppliedTheme(page, initialTheme);

      await selectTheme(page, targetTheme);

      await checkSelectedTheme(page, targetTheme);
      await checkStoredTheme(
        page,
        storedThemeValue(targetTheme, colorScheme),
      );
      await checkAppliedTheme(page, targetTheme);

      await page.reload();

      await checkSelectedTheme(page, targetTheme);
      await checkStoredTheme(
        page,
        storedThemeValue(targetTheme, colorScheme),
      );
      await checkAppliedTheme(page, targetTheme);
    });
  }

  shouldUpdateTheme('light', 'dark');
  shouldUpdateTheme('dark', 'light');

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

  test('should switch back to system and persist the resolved theme after reload', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      colorScheme: 'light',
      baseURL,
      cookies: [
        {
          name: 'theme',
          value: storedThemeValue('dark', 'light'),
        },
      ],
    });
    const page = await context.newPage();

    await gotoHome(page);

    await checkSelectedTheme(page, 'dark');
    await checkStoredTheme(
      page,
      storedThemeValue('dark', 'light'),
    );
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
