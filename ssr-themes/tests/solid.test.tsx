/** @jsxImportSource solid-js */
// @vitest-environment jsdom

import type {ParentProps} from 'solid-js';
import {createEffect} from 'solid-js';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest';
import {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
} from '../src/solid';
import {
  getCookieValue,
  installThemeTestEnv,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const ThemeReporter = (props: {
  forceSetTheme?: string;
}) => {
  const theme = useTheme<string, boolean>();

  createEffect(() => {
    if (props.forceSetTheme) {
      theme.setTheme(props.forceSetTheme);
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

const createThemeWrapper = (
  props: ThemeProviderProps<string, boolean>,
) => {
  const ThemeWrapper = (wrapperProps: ParentProps) => (
    <ThemeProvider {...props}>
      {wrapperProps.children}
    </ThemeProvider>
  );

  return ThemeWrapper;
};

const renderTheme = (
  providerProps: ThemeProviderProps<string, boolean>,
  reporterProps: {forceSetTheme?: string} = {},
) =>
  render(() => <ThemeReporter {...reporterProps} />, {
    wrapper: createThemeWrapper(providerProps),
  });

afterEach(() => {
  cleanup();
});

describe('solid bindings', () => {
  test('uses the system theme by default', async () => {
    setDeviceTheme('dark');
    renderTheme({});

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

  test('updates the DOM and cookie when setting a theme', async () => {
    renderTheme({}, {forceSetTheme: 'dark'});

    await waitFor(() => {
      expect(
        screen.getByTestId('theme').textContent,
      ).toBe('dark');
      expect(getCookieValue('theme')).toBe('dark');
      expect(
        document.documentElement.classList.contains(
          'dark',
        ),
      ).toBe(true);
      expect(
        document.documentElement.style.colorScheme,
      ).toBe('dark');
    });
  });

  test('ignores nested providers', async () => {
    render(() => (
      <ThemeProvider defaultTheme="dark">
        <ThemeProvider defaultTheme="light">
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
    expect(() =>
      render(() => <ThemeReporter />),
    ).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });
});
