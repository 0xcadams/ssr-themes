import {describe, expect, it} from 'vitest';

import {initTheme} from '../src/index';

describe('themeFromCookieHeader', () => {
  const defaultTheme = initTheme();

  it('returns undefined when the cookie header is missing or has no matching cookie', () => {
    expect(
      defaultTheme.themeFromCookieHeader(undefined),
    ).toBeUndefined();
    expect(
      defaultTheme.themeFromCookieHeader(null),
    ).toBeUndefined();
    expect(
      defaultTheme.themeFromCookieHeader(
        'session=abc; mode=dark',
      ),
    ).toBeUndefined();
  });

  it('reads the theme from the default cookie name regardless of cookie order', () => {
    expect(
      defaultTheme.themeFromCookieHeader(
        'session=abc; theme=dark',
      ),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
    expect(
      defaultTheme.themeFromCookieHeader(
        'theme=light; session=abc',
      ),
    ).toEqual({
      selectedTheme: 'light',
      appliedTheme: 'light',
    });
  });

  it('trims cookie whitespace before matching the cookie name', () => {
    expect(
      defaultTheme.themeFromCookieHeader(
        'session=abc;   theme=dark',
      ),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
  });

  it('supports a custom cookie name', () => {
    const theme = initTheme({
      cookie: {name: 'color-mode'},
    });

    expect(
      theme.themeFromCookieHeader(
        'session=abc; color-mode=light',
      ),
    ).toEqual({
      selectedTheme: 'light',
      appliedTheme: 'light',
    });
  });

  it('decodes URL-encoded cookie values, including encoded separators', () => {
    const themeWithSpaces = initTheme({
      themes: ['solarized light'],
    });
    const themeWithEquals = initTheme({
      themes: ['solarized=light'],
    });

    expect(
      themeWithSpaces.themeFromCookieHeader(
        'theme=solarized%20light',
      ),
    ).toEqual({
      selectedTheme: 'solarized light',
      appliedTheme: 'solarized light',
    });
    expect(
      themeWithEquals.themeFromCookieHeader(
        'theme=solarized%3Dlight',
      ),
    ).toEqual({
      selectedTheme: 'solarized=light',
      appliedTheme: 'solarized=light',
    });
  });

  it('validates cookie values against the provided theme list', () => {
    const theme = initTheme({
      themes: ['light', 'pink'],
    });

    expect(
      theme.themeFromCookieHeader('theme=pink'),
    ).toEqual({
      selectedTheme: 'pink',
      appliedTheme: 'pink',
    });

    expect(
      theme.themeFromCookieHeader('theme=dark'),
    ).toBeUndefined();
  });

  it('allows system when system support is enabled, even if themes omits it', () => {
    const theme = initTheme({
      themes: ['light', 'dark'],
    });

    expect(
      theme.themeFromCookieHeader('theme=~d'),
    ).toEqual({
      selectedTheme: 'system',
      appliedTheme: 'dark',
    });
  });

  it('reads compact system values from the cookie', () => {
    expect(
      defaultTheme.themeFromCookieHeader('theme=~l'),
    ).toEqual({
      selectedTheme: 'system',
      appliedTheme: 'light',
    });
  });

  it('falls back to the resolved theme when system support is disabled', () => {
    const theme = initTheme({
      enableSystem: false,
      themes: ['light', 'dark'],
    });

    expect(
      theme.themeFromCookieHeader('theme=~d'),
    ).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
  });
  it('treats plain system cookie values as invalid', () => {
    expect(
      defaultTheme.themeFromCookieHeader(
        'theme=system',
      ),
    ).toBeUndefined();
  });

  it('returns undefined for empty cookie values', () => {
    expect(
      defaultTheme.themeFromCookieHeader('theme='),
    ).toBeUndefined();
  });

  it('returns undefined for malformed cookie values', () => {
    expect(
      defaultTheme.themeFromCookieHeader(
        'theme=%E0%A4%A',
      ),
    ).toBeUndefined();
  });
});
