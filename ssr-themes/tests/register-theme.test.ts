import {
  describe,
  expect,
  expectTypeOf,
  it,
} from 'vitest';

import {
  registerTheme,
  type ThemeHtmlProps,
} from '../src';

describe('registerTheme', () => {
  it('returns JSX props by default', () => {
    expect(
      registerTheme({
        attribute: ['class', 'data-theme'],
        className: 'app-shell',
        selectedTheme: 'dark',
        style: {
          '--accent': '#fff',
        },
        valueMap: {
          dark: 'night',
        },
      }),
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
    expect(
      registerTheme({
        className: 'app-shell',
        selectedTheme: 'system',
        style: {
          '--accent': '#fff',
        },
      }),
    ).toEqual({
      className: 'app-shell',
      style: {
        '--accent': '#fff',
      },
    });
  });

  it('returns serialized HTML in html-string mode', () => {
    expect(
      registerTheme({
        attribute: ['class', 'data-theme'],
        className: 'app-shell',
        selectedTheme: 'dark',
        renderMode: 'html-string',
        style: {
          '--accent': '#fff',
        },
      }),
    ).toBe(
      'class="app-shell dark" style="--accent:#fff;color-scheme:dark" data-theme="dark"',
    );
  });

  it('escapes serialized attribute values', () => {
    expect(
      registerTheme({
        attribute: 'class',
        className: 'quote"test',
        selectedTheme: 'light',
        renderMode: 'html-string',
        style: {
          '--content': '<tag>&"',
        },
      }),
    ).toBe(
      'class="quote&quot;test light" style="--content:&lt;tag&gt;&amp;&quot;;color-scheme:light"',
    );
  });

  it('infers return types from the render mode', () => {
    const jsxProps = registerTheme({
      attribute: ['class', 'data-theme'] as const,
      selectedTheme: 'dark',
    });
    const htmlString = registerTheme({
      selectedTheme: 'dark',
      renderMode: 'html-string',
    });
    const explicitHtmlString = registerTheme<
      'light' | 'dark',
      true
    >({
      selectedTheme: 'system',
      renderMode: 'html-string',
    });

    expectTypeOf(jsxProps).toEqualTypeOf<
      ThemeHtmlProps<readonly ['class', 'data-theme']>
    >();
    expectTypeOf(htmlString).toEqualTypeOf<string>();
    expectTypeOf(
      explicitHtmlString,
    ).toEqualTypeOf<string>();
  });

  it('uses appliedTheme when selectedTheme is system', () => {
    expect(
      registerTheme({
        attribute: ['class', 'data-theme'],
        selectedTheme: 'system',
        appliedTheme: 'dark',
      }),
    ).toEqual({
      'data-theme': 'dark',
      'className': 'dark',
      'style': {
        colorScheme: 'dark',
      },
    });
  });
});
