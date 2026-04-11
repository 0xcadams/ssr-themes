/** @jsxImportSource solid-js */
// @vitest-environment jsdom

import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import {createEffect} from 'solid-js';
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest';
import {initTheme} from '../src';
import {bindTheme} from '../src/solid';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const createSolidHarness = (
  options?: Parameters<typeof initTheme>[0],
) => {
  const theme = initTheme(options);
  const {ThemeProvider, useTheme} = bindTheme(theme);

  const ThemeReporter = (props: {
    forceSetTheme?: string;
  }) => {
    const theme = useTheme();

    createEffect(() => {
      if (props.forceSetTheme) {
        theme.setTheme(props.forceSetTheme as never);
      }
    });

    return (
      <>
        <p data-testid="theme">{theme.theme()}</p>
        <p data-testid="forcedTheme">
          {theme.forcedTheme()}
        </p>
        <p data-testid="resolvedTheme">
          {theme.resolvedTheme()}
        </p>
        <p data-testid="colorScheme">
          {theme.colorScheme()}
        </p>
      </>
    );
  };

  const renderTheme = (
    providerProps: Parameters<
      typeof ThemeProvider
    >[0] = {},
    reporterProps: {forceSetTheme?: string} = {},
  ) => {
    render(() => (
      <ThemeProvider {...providerProps}>
        <ThemeReporter {...reporterProps} />
      </ThemeProvider>
    ));
  };

  return {
    ThemeProvider,
    ThemeReporter,
    renderTheme,
    useTheme,
  };
};

afterEach(() => {
  cleanup();
});

describe('solid bindings', () => {
  test('uses the system theme by default', async () => {
    setDeviceTheme('dark');
    const {renderTheme} = createSolidHarness();

    renderTheme();

    await waitFor(() => {
      expect(
        screen.getByTestId('theme').textContent,
      ).toBe('system');
      expect(
        screen.getByTestId('resolvedTheme')
          .textContent,
      ).toBe('dark');
      expect(
        screen.getByTestId('colorScheme').textContent,
      ).toBe('dark');
    });
  });

  test('persists the default system theme with a compact cookie value', async () => {
    setDeviceTheme('dark');
    const {renderTheme} = createSolidHarness();

    renderTheme();

    await waitFor(() => {
      expect(getCookieValue('theme')).toBe('~d');
    });
  });

  test('updates the DOM and cookie when setting a theme', async () => {
    const {renderTheme} = createSolidHarness();

    renderTheme({}, {forceSetTheme: 'dark'});

    await waitFor(() => {
      expect(
        screen.getByTestId('theme').textContent,
      ).toBe('dark');
      expect(getCookieValue('theme')).toBe('dark~l');
      expect(
        document.documentElement.classList.contains(
          'dark',
        ),
      ).toBe(true);
    });
  });

  test('supports custom attributes and value maps from initTheme', async () => {
    const {renderTheme} = createSolidHarness({
      attribute: ['data-theme', 'class'],
      themes: ['light', 'dark', 'pink'],
      valueMap: {pink: 'night'},
    });

    renderTheme({}, {forceSetTheme: 'pink'});

    await waitFor(() => {
      expect(
        document.documentElement.getAttribute(
          'data-theme',
        ),
      ).toBe('night');
      expect(
        document.documentElement.classList.contains(
          'night',
        ),
      ).toBe(true);
    });
  });

  test('ignores nested providers', async () => {
    const {ThemeProvider, ThemeReporter} =
      createSolidHarness({
        defaultTheme: 'dark',
      });

    render(() => (
      <ThemeProvider selectedTheme="dark">
        <ThemeProvider selectedTheme="light">
          <ThemeReporter />
        </ThemeProvider>
      </ThemeProvider>
    ));

    await waitFor(() => {
      expect(
        screen.getByTestId('theme').textContent,
      ).toBe('dark');
    });
  });

  test('throws when useTheme is used outside the provider', () => {
    const {ThemeReporter} = createSolidHarness();

    expect(() =>
      render(() => <ThemeReporter />),
    ).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });

  test('supports forced theme runtime props', async () => {
    setCookieValue('theme', 'dark');
    const {renderTheme} = createSolidHarness();

    renderTheme({forcedTheme: 'light'});

    await waitFor(() => {
      expect(
        screen.getByTestId('theme').textContent,
      ).toBe('dark');
      expect(
        screen.getByTestId('forcedTheme').textContent,
      ).toBe('light');
      expect(
        screen.getByTestId('resolvedTheme')
          .textContent,
      ).toBe('light');
    });
  });
});
