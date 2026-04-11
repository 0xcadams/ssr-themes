// @vitest-environment jsdom
/** @jsxImportSource solid-js */

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
import {createTheme} from '../src';
import {bindTheme} from '../src/solid';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const createSolidHarness = (
  options?: Parameters<typeof createTheme>[0],
) => {
  const theme = createTheme(options);
  const {ThemeProvider, useTheme} = bindTheme(theme);

  const ThemeReporter = (props: {
    forceSetTheme?: string;
  }) => {
    const theme = useTheme();

    createEffect(() => {
      if (props.forceSetTheme) {
        theme.setSelected(
          props.forceSetTheme as never,
        );
      }
    });

    return (
      <>
        <p data-testid="selected">
          {theme.selected()}
        </p>
        <p data-testid="forced">{theme.forced()}</p>
        <p data-testid="resolved">
          {theme.resolved()}
        </p>
        <p data-testid="system">{theme.system()}</p>
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
        screen.getByTestId('selected').textContent,
      ).toBe('system');
      expect(
        screen.getByTestId('resolved').textContent,
      ).toBe('dark');
      expect(
        screen.getByTestId('system').textContent,
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

  test('accepts spread theme state props', async () => {
    setDeviceTheme('dark');
    const {renderTheme} = createSolidHarness();

    renderTheme({
      initial: {
        selected: 'light',
        resolved: 'light',
        system: 'dark',
      },
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('selected').textContent,
      ).toBe('light');
      expect(
        screen.getByTestId('resolved').textContent,
      ).toBe('light');
      expect(
        screen.getByTestId('system').textContent,
      ).toBe('dark');
    });
  });

  test('updates the DOM and cookie when setting a theme', async () => {
    const {renderTheme} = createSolidHarness();

    renderTheme({}, {forceSetTheme: 'dark'});

    await waitFor(() => {
      expect(
        screen.getByTestId('selected').textContent,
      ).toBe('dark');
      expect(getCookieValue('theme')).toBe('dark~l');
      expect(
        document.documentElement.classList.contains(
          'dark',
        ),
      ).toBe(true);
    });
  });

  test('supports custom attributes and value maps from createTheme', async () => {
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
      <ThemeProvider
        initial={{
          selected: 'dark',
          resolved: 'dark',
        }}
      >
        <ThemeProvider
          initial={{
            selected: 'light',
            resolved: 'light',
          }}
        >
          <ThemeReporter />
        </ThemeProvider>
      </ThemeProvider>
    ));

    await waitFor(() => {
      expect(
        screen.getByTestId('selected').textContent,
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
    setCookieValue('theme', 'dark~l');
    const {renderTheme} = createSolidHarness();

    renderTheme({forced: 'light'});

    await waitFor(() => {
      expect(
        screen.getByTestId('selected').textContent,
      ).toBe('dark');
      expect(
        screen.getByTestId('forced').textContent,
      ).toBe('light');
      expect(
        screen.getByTestId('resolved').textContent,
      ).toBe('light');
    });
  });
});
