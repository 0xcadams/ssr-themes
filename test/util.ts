import {Page, expect, Browser} from '@playwright/test';

export async function checkAppliedTheme(
  page: Page,
  theme: string,
) {
  expect(
    await page.evaluate(
      currentTheme =>
        document.documentElement.classList.contains(
          currentTheme,
        ),
      theme,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      document.documentElement.getAttribute('style'),
    ),
  ).toBe(`color-scheme: ${theme};`);
}

export async function checkStoredTheme(
  page: Page,
  expectedTheme: string,
  storageKey = 'theme',
) {
  const storedTheme = await page.evaluate(key => {
    const cookies = document.cookie
      ? document.cookie.split('; ')
      : [];
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === key) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return null;
  }, storageKey);
  expect(storedTheme).toBe(expectedTheme);
}

type MakeBrowserContextOptions = {
  baseURL?: string;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  cookies?: {name: string; value: string}[];
};

export async function makeBrowserContext(
  browser: Browser,
  options: MakeBrowserContextOptions,
) {
  const origin =
    options.baseURL ?? 'http://localhost:3000';
  const cookies = (options.cookies ?? []).map(
    cookie => ({
      name: cookie.name,
      value: cookie.value,
      url: origin,
      path: '/',
      sameSite: 'Lax' as const,
      domain: new URL(origin).hostname,
      expires: Math.floor(Date.now() / 1000) + 3600,
      httpOnly: false,
      secure: origin.startsWith('https'),
    }),
  );

  return await browser.newContext({
    colorScheme:
      options.colorScheme ?? 'no-preference',
    storageState: {
      cookies,
      origins: [],
    },
  });
}
