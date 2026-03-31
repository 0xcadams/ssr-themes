import {describe, expect, it} from 'vitest';

import {themeFromCookieHeader} from '../src/index';

describe('themeFromCookieHeader', () => {
  it('returns undefined when the cookie header is missing or has no matching cookie', () => {
    expect(
      themeFromCookieHeader(undefined),
    ).toBeUndefined();
    expect(
      themeFromCookieHeader(null),
    ).toBeUndefined();
    expect(
      themeFromCookieHeader('session=abc; mode=dark'),
    ).toBeUndefined();
  });

  it('reads the theme from the default cookie name regardless of cookie order', () => {
    expect(
      themeFromCookieHeader('session=abc; theme=dark'),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
    expect(
      themeFromCookieHeader(
        'theme=light; session=abc',
      ),
    ).toEqual({
      selectedTheme: 'light',
      appliedTheme: 'light',
    });
  });

  it('trims cookie whitespace before matching the cookie name', () => {
    expect(
      themeFromCookieHeader(
        'session=abc;   theme=dark',
      ),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
  });

  it('supports a custom cookie name', () => {
    expect(
      themeFromCookieHeader(
        'session=abc; color-mode=light',
        {
          cookieName: 'color-mode',
        },
      ),
    ).toEqual({
      selectedTheme: 'light',
      appliedTheme: 'light',
    });
  });

  it('decodes URL-encoded cookie values, including encoded separators', () => {
    expect(
      themeFromCookieHeader<'solarized light'>(
        'theme=solarized%20light',
      ),
    ).toEqual({
      selectedTheme: 'solarized light',
      appliedTheme: 'solarized light',
    });
    expect(
      themeFromCookieHeader<'solarized=light'>(
        'theme=solarized%3Dlight',
      ),
    ).toEqual({
      selectedTheme: 'solarized=light',
      appliedTheme: 'solarized=light',
    });
  });

  it('validates cookie values against the provided theme list', () => {
    expect(
      themeFromCookieHeader<'light' | 'pink'>(
        'theme=pink',
        {
          themes: ['light', 'pink'],
        },
      ),
    ).toEqual({
      selectedTheme: 'pink',
      appliedTheme: 'pink',
    });

    expect(
      themeFromCookieHeader<'light' | 'pink'>(
        'theme=dark',
        {
          themes: ['light', 'pink'],
        },
      ),
    ).toBeUndefined();
  });

  it('allows system when system support is enabled, even if themes omits it', () => {
    expect(
      themeFromCookieHeader<'light' | 'dark'>(
        'theme=~d',
        {
          themes: ['light', 'dark'],
        },
      ),
    ).toEqual({
      selectedTheme: 'system',
      appliedTheme: 'dark',
    });
  });

  it('reads compact system values from the cookie', () => {
    expect(themeFromCookieHeader('theme=~l')).toEqual({
      selectedTheme: 'system',
      appliedTheme: 'light',
    });
  });

  it('falls back to the resolved theme when system support is disabled', () => {
    expect(
      themeFromCookieHeader<'light' | 'dark', false>(
        'theme=~d',
        {
          enableSystem: false,
          themes: ['light', 'dark'],
        },
      ),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
  });
  it('treats plain system cookie values as invalid', () => {
    expect(
      themeFromCookieHeader('theme=system'),
    ).toBeUndefined();
  });

  it('returns undefined for empty cookie values', () => {
    expect(
      themeFromCookieHeader('theme='),
    ).toBeUndefined();
  });

  it('returns undefined for malformed cookie values', () => {
    expect(
      themeFromCookieHeader('theme=%E0%A4%A'),
    ).toBeUndefined();
  });
});
