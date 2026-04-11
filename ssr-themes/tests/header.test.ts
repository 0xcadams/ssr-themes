import {describe, expect, it} from 'vitest';

import {createTheme} from '../src/index';

describe('parseThemeCookie', () => {
  const defaultTheme = createTheme();

  it('returns undefined when the cookie header is missing or has no matching cookie', () => {
    expect(
      defaultTheme.parseThemeCookie(undefined),
    ).toBeUndefined();
    expect(
      defaultTheme.parseThemeCookie(null),
    ).toBeUndefined();
    expect(
      defaultTheme.parseThemeCookie(
        'session=abc; mode=dark',
      ),
    ).toBeUndefined();
  });

  it('reads the theme from the default cookie name regardless of cookie order', () => {
    expect(
      defaultTheme.parseThemeCookie(
        'session=abc; theme=dark~d',
      ),
    ).toEqual({
      selected: 'dark',
      resolved: 'dark',
      system: 'dark',
    });
    expect(
      defaultTheme.parseThemeCookie(
        'theme=light~l; session=abc',
      ),
    ).toEqual({
      selected: 'light',
      resolved: 'light',
      system: 'light',
    });
  });

  it('trims cookie whitespace before matching the cookie name', () => {
    expect(
      defaultTheme.parseThemeCookie(
        'session=abc;   theme=dark~d',
      ),
    ).toEqual({
      selected: 'dark',
      resolved: 'dark',
      system: 'dark',
    });
  });

  it('supports a custom cookie name', () => {
    const theme = createTheme({
      cookie: {name: 'color-mode'},
    });

    expect(
      theme.parseThemeCookie(
        'session=abc; color-mode=light~l',
      ),
    ).toEqual({
      selected: 'light',
      resolved: 'light',
      system: 'light',
    });
  });

  it('decodes URL-encoded cookie values, including encoded separators', () => {
    const themeWithSpaces = createTheme({
      themes: ['solarized light'],
    });
    const themeWithEquals = createTheme({
      themes: ['solarized=light'],
    });

    expect(
      themeWithSpaces.parseThemeCookie(
        'theme=solarized%20light~l',
      ),
    ).toEqual({
      selected: 'solarized light',
      resolved: 'solarized light',
      system: 'light',
    });
    expect(
      themeWithEquals.parseThemeCookie(
        'theme=solarized%3Dlight~d',
      ),
    ).toEqual({
      selected: 'solarized=light',
      resolved: 'solarized=light',
      system: 'dark',
    });
  });

  it('validates cookie values against the provided theme list', () => {
    const theme = createTheme({
      themes: ['light', 'pink'],
    });

    expect(
      theme.parseThemeCookie('theme=pink~l'),
    ).toEqual({
      selected: 'pink',
      resolved: 'pink',
      system: 'light',
    });

    expect(
      theme.parseThemeCookie('theme=dark~d'),
    ).toBeUndefined();
  });

  it('allows system when system support is enabled, even if themes omits it', () => {
    const theme = createTheme({
      themes: ['light', 'dark'],
    });

    expect(theme.parseThemeCookie('theme=~d')).toEqual(
      {
        selected: 'system',
        resolved: 'dark',
        system: 'dark',
      },
    );
  });

  it('reads compact system values from the cookie', () => {
    expect(
      defaultTheme.parseThemeCookie('theme=~l'),
    ).toEqual({
      selected: 'system',
      resolved: 'light',
      system: 'light',
    });
  });

  it('reads explicit themes with a system hint from the cookie', () => {
    expect(
      defaultTheme.parseThemeCookie('theme=dark~l'),
    ).toEqual({
      selected: 'dark',
      resolved: 'dark',
      system: 'light',
    });
  });

  it('falls back to the resolved theme when system support is disabled', () => {
    const theme = createTheme({
      enableSystem: false,
      themes: ['light', 'dark'],
    });

    expect(theme.parseThemeCookie('theme=~d')).toEqual(
      {
        selected: 'dark',
        resolved: 'dark',
        system: 'dark',
      },
    );
  });

  it('treats bare explicit cookie values as invalid', () => {
    expect(
      defaultTheme.parseThemeCookie('theme=dark'),
    ).toBeUndefined();
  });

  it('treats plain system cookie values as invalid', () => {
    expect(
      defaultTheme.parseThemeCookie('theme=system'),
    ).toBeUndefined();
  });

  it('returns undefined for empty cookie values', () => {
    expect(
      defaultTheme.parseThemeCookie('theme='),
    ).toBeUndefined();
  });

  it('returns undefined for malformed cookie values', () => {
    expect(
      defaultTheme.parseThemeCookie('theme=%E0%A4%A'),
    ).toBeUndefined();
  });
});
