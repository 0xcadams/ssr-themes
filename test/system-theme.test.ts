import {test} from '@playwright/test';
import {
  checkAppliedTheme,
  checkSelectedTheme,
  checkServerRenderedTheme,
  checkStoredTheme,
  makeBrowserContext,
} from './util';

test.describe('system theme test-suite', () => {
  function testBaseTheme(
    pagePath: string,
    preferredColorScheme: 'light' | 'dark',
    expectedTheme: 'light' | 'dark',
  ) {
    test(`should render ${expectedTheme} theme if preferred-colorscheme is ${preferredColorScheme}`, async ({
      browser,
      baseURL,
    }) => {
      const context = await makeBrowserContext(
        browser,
        {
          colorScheme: preferredColorScheme,
          baseURL,
          cookies: [{name: 'theme', value: '~d'}],
        },
      );

      const page = await context.newPage();
      await page.goto(pagePath);

      await checkSelectedTheme(page, 'system');
      await checkStoredTheme(
        page,
        preferredColorScheme === 'dark' ? '~d' : '~l',
      );
      await checkAppliedTheme(page, expectedTheme);

      await page.reload();

      await checkSelectedTheme(page, 'system');
      await checkStoredTheme(
        page,
        preferredColorScheme === 'dark' ? '~d' : '~l',
      );
      await checkAppliedTheme(page, expectedTheme);
    });
  }

  testBaseTheme('/', 'light', 'light');
  testBaseTheme('/', 'dark', 'dark');

  test('should server render the stored compact system theme without javascript', async ({
    browser,
    baseURL,
  }) => {
    const context = await makeBrowserContext(browser, {
      baseURL,
      cookies: [{name: 'theme', value: '~d'}],
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/');

    await checkServerRenderedTheme(page, 'dark');
  });
});
