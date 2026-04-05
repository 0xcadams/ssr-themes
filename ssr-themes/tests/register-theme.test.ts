import {
  describe,
  expect,
  expectTypeOf,
  it,
} from 'vitest';

import {initTheme, type ThemeHtmlProps} from '../src';

describe('registerTheme', () => {
  it('returns JSX props by default', () => {
    const {registerTheme} = initTheme({
      attribute: ['class', 'data-theme'],
      valueMap: {
        dark: 'night',
      },
    });

    expect(
      registerTheme(
        {
          selectedTheme: 'dark',
          appliedTheme: 'dark',
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
    const {registerTheme} = initTheme();

    expect(
      registerTheme(
        {
          selectedTheme: 'system',
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
      style: {
        '--accent': '#fff',
      },
    });
  });

  it('returns serialized HTML in html-string mode', () => {
    const {registerTheme} = initTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme(
        {
          selectedTheme: 'dark',
          appliedTheme: 'dark',
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

  it('escapes serialized attribute values', () => {
    const {registerTheme} = initTheme();

    expect(
      registerTheme(
        {
          selectedTheme: 'light',
          appliedTheme: 'light',
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
    const {registerTheme} = initTheme({
      attribute: ['class', 'data-theme'] as const,
    });
    const jsxProps = registerTheme({
      selectedTheme: 'dark',
      appliedTheme: 'dark',
    });
    const htmlString = registerTheme(
      {
        selectedTheme: 'dark',
        appliedTheme: 'dark',
      },
      {
        renderMode: 'html-string',
      },
    );
    const explicitHtmlString = initTheme<{
      themes: ['light', 'dark'];
    }>({
      themes: ['light', 'dark'],
    }).registerTheme(
      {
        selectedTheme: 'system',
        appliedTheme: 'dark',
      },
      {
        renderMode: 'html-string',
      },
    );

    expectTypeOf(jsxProps).toEqualTypeOf<
      ThemeHtmlProps<readonly ['class', 'data-theme']>
    >();
    expectTypeOf(htmlString).toEqualTypeOf<string>();
    expectTypeOf(
      explicitHtmlString,
    ).toEqualTypeOf<string>();
  });

  it('uses appliedTheme when selectedTheme is system', () => {
    const {registerTheme} = initTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme({
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

  it('supports forcedTheme runtime overrides', () => {
    const {registerTheme} = initTheme({
      attribute: ['class', 'data-theme'],
    });

    expect(
      registerTheme(
        {
          selectedTheme: 'light',
          appliedTheme: 'light',
        },
        {
          forcedTheme: 'dark',
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
});
