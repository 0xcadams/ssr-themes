import {
  describe,
  expect,
  expectTypeOf,
  it,
} from 'vitest';

import {
  createTheme,
  type ThemeHtmlAttributes,
  type ThemeHtmlProps,
} from '../src';
import type {HumanReadable} from '../src/types';

describe('registerTheme', () => {
  it('returns JSX props by default', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
      valueMap: {
        dark: 'night',
      },
    });

    expect(
      registerTheme(
        {
          selected: 'dark',
          resolved: 'dark',
        },
        {
          className: 'app-shell',
          style: {
            '--accent': '#fff',
          },
        },
      ),
    ).toEqual({
      'data-theme': 'night',
      'className': 'app-shell night',
      'style': {
        '--accent': '#fff',
        'colorScheme': 'dark',
      },
    });
  });

  it('returns an empty theme registration for system mode', () => {
    const {registerTheme} = createTheme();

    expect(
      registerTheme(
        {
          selected: 'system',
        },
        {
          className: 'app-shell',
          style: {
            '--accent': '#fff',
          },
        },
      ),
    ).toEqual({
      className: 'app-shell',
      suppressHydrationWarning: true,
      style: {
        '--accent': '#fff',
      },
    });
  });

  it('adds suppressHydrationWarning when the theme is unknown', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(registerTheme()).toEqual({
      suppressHydrationWarning: true,
    });
  });

  it('returns serialized HTML in html-string mode', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme(
        {
          selected: 'dark',
          resolved: 'dark',
        },
        {
          className: 'app-shell',
          renderMode: 'html-string',
          style: {
            '--accent': '#fff',
          },
        },
      ),
    ).toBe(
      'class="app-shell dark" style="--accent:#fff;color-scheme:dark" data-theme="dark"',
    );
  });

  it('returns HTML attrs in html-attrs mode', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme(
        {
          selected: 'dark',
          resolved: 'dark',
        },
        {
          className: 'app-shell',
          renderMode: 'html-attrs',
          style: {
            '--accent': '#fff',
          },
        },
      ),
    ).toEqual({
      'class': 'app-shell dark',
      'data-theme': 'dark',
      'style': '--accent:#fff;color-scheme:dark',
    });
  });

  it('escapes serialized attribute values', () => {
    const {registerTheme} = createTheme();

    expect(
      registerTheme(
        {
          selected: 'light',
          resolved: 'light',
        },
        {
          className: 'quote"test',
          renderMode: 'html-string',
          style: {
            '--content': '<tag>&"',
          },
        },
      ),
    ).toBe(
      'class="quote&quot;test light" style="--content:&lt;tag&gt;&amp;&quot;;color-scheme:light"',
    );
  });

  it('infers return types from the render mode', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'] as const,
    });
    const jsxProps = registerTheme({
      selected: 'dark',
      resolved: 'dark',
    });
    const htmlAttributes = registerTheme(
      {
        selected: 'dark',
        resolved: 'dark',
      },
      {
        renderMode: 'html-attrs',
      },
    );
    const htmlString = registerTheme(
      {
        selected: 'dark',
        resolved: 'dark',
      },
      {
        renderMode: 'html-string',
      },
    );
    const explicitHtmlString = createTheme<{
      themes: ['light', 'dark'];
    }>({
      themes: ['light', 'dark'],
    }).registerTheme(
      {
        selected: 'system',
        resolved: 'dark',
      },
      {
        renderMode: 'html-string',
      },
    );

    expectTypeOf<typeof jsxProps>().toEqualTypeOf<
      HumanReadable<
        ThemeHtmlProps<
          readonly ['class', 'data-theme']
        >
      >
    >();
    expectTypeOf<
      typeof htmlAttributes
    >().toEqualTypeOf<
      HumanReadable<
        ThemeHtmlAttributes<
          readonly ['class', 'data-theme']
        >
      >
    >();
    expectTypeOf(htmlString).toEqualTypeOf<string>();
    expectTypeOf(
      explicitHtmlString,
    ).toEqualTypeOf<string>();
  });

  it('uses resolved when selected is system', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme({
        selected: 'system',
        resolved: 'dark',
      }),
    ).toEqual({
      'data-theme': 'dark',
      'className': 'dark',
      'style': {
        colorScheme: 'dark',
      },
    });
  });

  it('skips suppressHydrationWarning when system mode is resolved', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme({
        selected: 'system',
        resolved: 'dark',
      }).suppressHydrationWarning,
    ).toBeUndefined();
  });

  it('supports forced runtime overrides', () => {
    const {registerTheme} = createTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme(
        {
          selected: 'light',
          resolved: 'light',
        },
        {
          forced: 'dark',
        },
      ),
    ).toEqual({
      'data-theme': 'dark',
      'className': 'dark',
      'style': {
        colorScheme: 'dark',
      },
    });
  });

  it('does not add suppressHydrationWarning outside jsx mode', () => {
    const {registerTheme} = createTheme();

    expect(
      registerTheme(
        {
          selected: 'system',
        },
        {
          renderMode: 'html-attrs',
        },
      ),
    ).toEqual({});
    expect(
      registerTheme(
        {
          selected: 'system',
        },
        {
          renderMode: 'html-string',
        },
      ),
    ).toBe('');
  });
});
