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
    ).toBe('dark');
    expect(
      themeFromCookieHeader(
        'theme=light; session=abc',
      ),
    ).toBe('light');
  });

  it('trims cookie whitespace before matching the cookie name', () => {
    expect(
      themeFromCookieHeader(
        'session=abc;   theme=dark',
      ),
    ).toBe('dark');
  });

  it('supports a custom cookie name', () => {
    expect(
      themeFromCookieHeader(
        'session=abc; color-mode=light',
        {
          cookieName: 'color-mode',
        },
      ),
    ).toBe('light');
  });

  it('decodes URL-encoded cookie values, including encoded separators', () => {
    expect(
      themeFromCookieHeader<'solarized light'>(
        'theme=solarized%20light',
      ),
    ).toBe('solarized light');
    expect(
      themeFromCookieHeader<'solarized=light'>(
        'theme=solarized%3Dlight',
      ),
    ).toBe('solarized=light');
  });

  it('validates cookie values against the provided theme list', () => {
    expect(
      themeFromCookieHeader<'light' | 'pink'>(
        'theme=pink',
        {
          themes: ['light', 'pink'],
        },
      ),
    ).toBe('pink');

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
        'theme=system',
        {
          themes: ['light', 'dark'],
        },
      ),
    ).toBe('system');
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
