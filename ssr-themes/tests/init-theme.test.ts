import {describe, expect, it} from 'vitest';

import {createTheme} from '../src';

describe('createTheme helpers', () => {
  it('returns the exact options object', () => {
    const options = {
      themes: ['light', 'dark'] as const,
    };
    const theme = createTheme(options);

    expect(theme.options).toBe(options);
  });

  it('encodes explicit themes and compact system themes', () => {
    const theme = createTheme();

    expect(
      theme.encodeVariant({
        selected: 'dark',
        resolved: 'dark',
        system: 'light',
      }),
    ).toBe('dark~l');
    expect(
      theme.encodeVariant({
        selected: 'system',
        resolved: 'light',
      }),
    ).toBe('~l');
    expect(
      theme.encodeVariant({
        selected: 'system',
      }),
    ).toBeUndefined();
  });

  it('decodes compact system themes with bound theme options', () => {
    const theme = createTheme({
      themes: ['light', 'dark'],
    });

    expect(theme.decodeVariant('~d')).toEqual({
      selected: 'system',
      resolved: 'dark',
      system: 'dark',
    });
  });

  it('collapses compact system themes when system support is disabled', () => {
    const theme = createTheme({
      enableSystem: false,
      themes: ['light', 'dark'],
    });

    expect(theme.decodeVariant('~d')).toEqual({
      selected: 'dark',
      resolved: 'dark',
      system: 'dark',
    });
  });

  it('lists stable variants for prerendering', () => {
    const theme = createTheme({
      themes: ['light', 'dark', 'quartz'],
    });

    expect(theme.listVariants()).toEqual([
      {
        value: 'light~l',
        selected: 'light',
        resolved: 'light',
        system: 'light',
      },
      {
        value: 'light~d',
        selected: 'light',
        resolved: 'light',
        system: 'dark',
      },
      {
        value: 'dark~l',
        selected: 'dark',
        resolved: 'dark',
        system: 'light',
      },
      {
        value: 'dark~d',
        selected: 'dark',
        resolved: 'dark',
        system: 'dark',
      },
      {
        value: 'quartz~l',
        selected: 'quartz',
        resolved: 'quartz',
        system: 'light',
      },
      {
        value: 'quartz~d',
        selected: 'quartz',
        resolved: 'quartz',
        system: 'dark',
      },
      {
        value: '~l',
        selected: 'system',
        resolved: 'light',
        system: 'light',
      },
      {
        value: '~d',
        selected: 'system',
        resolved: 'dark',
        system: 'dark',
      },
    ]);
  });

  it('exposes a canonical default variant', () => {
    expect(createTheme().defaultVariant).toBe('~l');
    expect(
      createTheme({defaultTheme: 'dark'})
        .defaultVariant,
    ).toBe('dark~d');
    expect(
      createTheme({
        enableSystem: false,
      }).defaultVariant,
    ).toBe('light~l');
    expect(
      createTheme({
        themes: ['light', 'dark', 'quartz'],
        defaultTheme: 'quartz',
      }).defaultVariant,
    ).toBe('quartz~l');
  });
});
