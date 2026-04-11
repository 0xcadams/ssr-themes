import {describe, expect, it} from 'vitest';

import {initTheme} from '../src';

describe('initTheme helpers', () => {
  it('returns the exact themeOptions object', () => {
    const themeOptions = {
      themes: ['light', 'dark'] as const,
    };
    const theme = initTheme(themeOptions);

    expect(theme.themeOptions).toBe(themeOptions);
  });

  it('encodes explicit themes and compact system themes', () => {
    const theme = initTheme();

    expect(
      theme.encodeTheme({
        selectedTheme: 'dark',
        appliedTheme: 'dark',
        colorScheme: 'light',
      }),
    ).toBe('dark~l');
    expect(
      theme.encodeTheme({
        selectedTheme: 'system',
        appliedTheme: 'light',
      }),
    ).toBe('~l');
    expect(
      theme.encodeTheme({
        selectedTheme: 'system',
      }),
    ).toBeUndefined();
  });

  it('decodes compact system themes with bound theme options', () => {
    const theme = initTheme({
      themes: ['light', 'dark'],
    });

    expect(theme.decodeTheme('~d')).toEqual({
      selectedTheme: 'system',
      appliedTheme: 'dark',
      colorScheme: 'dark',
    });
  });

  it('collapses compact system themes when system support is disabled', () => {
    const theme = initTheme({
      enableSystem: false,
      themes: ['light', 'dark'],
    });

    expect(theme.decodeTheme('~d')).toEqual({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
      colorScheme: 'dark',
    });
  });

  it('lists stable variants for prerendering', () => {
    const theme = initTheme({
      themes: ['light', 'dark', 'quartz'],
    });

    expect(theme.themeVariants()).toEqual([
      {
        value: 'light~l',
        selectedTheme: 'light',
        appliedTheme: 'light',
        colorScheme: 'light',
      },
      {
        value: 'light~d',
        selectedTheme: 'light',
        appliedTheme: 'light',
        colorScheme: 'dark',
      },
      {
        value: 'dark~l',
        selectedTheme: 'dark',
        appliedTheme: 'dark',
        colorScheme: 'light',
      },
      {
        value: 'dark~d',
        selectedTheme: 'dark',
        appliedTheme: 'dark',
        colorScheme: 'dark',
      },
      {
        value: 'quartz~l',
        selectedTheme: 'quartz',
        appliedTheme: 'quartz',
        colorScheme: 'light',
      },
      {
        value: 'quartz~d',
        selectedTheme: 'quartz',
        appliedTheme: 'quartz',
        colorScheme: 'dark',
      },
      {
        value: '~l',
        selectedTheme: 'system',
        appliedTheme: 'light',
        colorScheme: 'light',
      },
      {
        value: '~d',
        selectedTheme: 'system',
        appliedTheme: 'dark',
        colorScheme: 'dark',
      },
    ]);
  });
});
