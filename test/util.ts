import {Page, expect, Browser} from '@playwright/test';

export async function checkAppliedTheme(
  page: Page,
  theme: string,
) {
  await expect
    .poll(async () => {
      return await page.evaluate(
        currentTheme =>
          document.documentElement.classList.contains(
            currentTheme,
          ),
        theme,
      );
    })
    .toBe(true);

  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.style.colorScheme,
      );
    })
    .toBe(theme);
}

export async function checkStoredTheme(
  page: Page,
  expectedTheme: string,
  storageKey = 'theme',
) {
  await expect
    .poll(async () => {
      return await page.evaluate(key => {
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
    })
    .toBe(expectedTheme);
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
      sameSite: 'Lax' as const,
      expires: Math.floor(Date.now() / 1000) + 3600,
      httpOnly: false,
      secure: origin.startsWith('https'),
    }),
  );
  const context = await browser.newContext({
    colorScheme:
      options.colorScheme ?? 'no-preference',
  });

  if (cookies.length) {
    await context.addCookies(cookies);
  }

  return context;
}
