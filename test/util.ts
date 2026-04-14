import {
  type Browser,
  expect,
  type Locator,
  type Page,
} from '@playwright/test';

export type PlaywrightApp =
  | 'astro'
  | 'next'
  | 'nuxt'
  | 'solid'
  | 'svelte'
  | 'tanstack-start';

export const playwrightApp = (process.env
  .PLAYWRIGHT_APP ?? 'next') as PlaywrightApp;

export function storedThemeValue(
  theme: 'dark' | 'light' | 'system',
  colorScheme: 'dark' | 'light',
) {
  const suffix = colorScheme === 'dark' ? '~d' : '~l';

  return theme === 'system'
    ? suffix
    : `${theme}${suffix}`;
}

export function getThemeSelector(page: Page): Locator {
  return page.locator(
    '[data-test-id="theme-selector"]',
  );
}

export async function gotoHome(page: Page) {
  await page.goto('/');
  const selector = getThemeSelector(page);

  await selector.waitFor();
  await page.waitForTimeout(1000);
}

export async function selectTheme(
  page: Page,
  theme: 'dark' | 'light' | 'system',
) {
  await getThemeSelector(page).selectOption(theme);
}

export async function checkSelectedTheme(
  page: Page,
  theme: 'dark' | 'light' | 'system',
) {
  await expect(getThemeSelector(page)).toHaveValue(
    theme,
  );
}

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

export async function checkServerRenderedTheme(
  page: Page,
  theme: string,
) {
  const html = page.locator('html');

  await expect(html).toHaveAttribute(
    'class',
    new RegExp(`(^|\\s)${theme}(\\s|$)`),
  );
  await expect(html).toHaveAttribute(
    'style',
    new RegExp(`color-scheme:\\s*${theme}`),
  );
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

export async function checkStoredThemeMissing(
  page: Page,
  storageKey = 'theme',
) {
  await expect
    .poll(async () => {
      return await page.evaluate(key => {
        const cookies = document.cookie
          ? document.cookie.split('; ')
          : [];
        for (const cookie of cookies) {
          const [name] = cookie.split('=');
          if (name === key) {
            return false;
          }
        }

        return true;
      }, storageKey);
    })
    .toBe(true);
}

type MakeBrowserContextOptions = {
  baseURL?: string;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  cookies?: {name: string; value: string}[];
  javaScriptEnabled?: boolean;
};

export async function makeBrowserContext(
  browser: Browser,
  options: MakeBrowserContextOptions,
) {
  const origin =
    options.baseURL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    'http://localhost:4041';
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
    javaScriptEnabled:
      options.javaScriptEnabled ?? true,
  });

  if (cookies.length) {
    await context.addCookies(cookies);
  }

  return context;
}
