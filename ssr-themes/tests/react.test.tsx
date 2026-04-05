// @vitest-environment jsdom

import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';
import {
  afterEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from 'vitest';
import {initTheme} from '../src';
import {bindTheme} from '../src/react';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const createReactHarness = (
  options?: Parameters<typeof initTheme>[0],
) => {
  const theme = initTheme(options);
  const {ThemeProvider, useTheme} = bindTheme(theme);

  const ThemeReporter = ({
    forceSetTheme,
  }: {
    forceSetTheme?: string;
  }) => {
    const {
      setTheme,
      theme,
      forcedTheme,
      resolvedTheme,
      colorScheme,
    } = useTheme();

    React.useEffect(() => {
      if (forceSetTheme) {
        setTheme(forceSetTheme as never);
      }
    }, [forceSetTheme, setTheme]);

    return (
      <>
        <p data-testid="theme">{theme}</p>
        <p data-testid="forcedTheme">{forcedTheme}</p>
        <p data-testid="resolvedTheme">
          {resolvedTheme}
        </p>
        <p data-testid="colorScheme">{colorScheme}</p>
      </>
    );
  };

  const makeWrapper = (
    props: React.ComponentProps<
      typeof ThemeProvider
    > = {},
  ) => {
    const Wrapper = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <ThemeProvider {...props}>
        {children}
      </ThemeProvider>
    );

    return Wrapper;
  };

  return {
    ThemeProvider,
    ThemeReporter,
    makeWrapper,
    theme,
    useTheme,
  };
};

afterEach(() => {
  cleanup();
});

describe('react bindings', () => {
  test('infers literal theme tuples from initTheme without as const', () => {
    const theme = initTheme({
      themes: ['light', 'dark', 'quartz'],
    });
    const {useTheme} = bindTheme(theme);

    expectTypeOf<
      typeof theme.options.themes
    >().toEqualTypeOf<
      readonly ['light', 'dark', 'quartz']
    >();
    expectTypeOf<
      ReturnType<typeof useTheme>['theme']
    >().toEqualTypeOf<
      | 'light'
      | 'dark'
      | 'quartz'
      | 'system'
      | undefined
    >();
  });

  test('uses the system theme by default', () => {
    setDeviceTheme('dark');
    const {makeWrapper, useTheme} =
      createReactHarness();

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('persists the default system theme with a compact cookie value', async () => {
    setDeviceTheme('dark');
    const {makeWrapper, useTheme} =
      createReactHarness();

    renderHook(() => useTheme(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(getCookieValue('theme')).toBe('~d');
    });
  });

  test('supports custom cookie names from initTheme', async () => {
    const {ThemeProvider, ThemeReporter} =
      createReactHarness({
        cookie: {name: 'color-mode'},
      });

    act(() => {
      render(
        <ThemeProvider>
          <ThemeReporter forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(getCookieValue('color-mode')).toBe(
        'light',
      );
    });
  });

  test('supports custom attributes and value maps from initTheme', async () => {
    const {ThemeProvider, ThemeReporter} =
      createReactHarness({
        attribute: ['data-theme', 'class'],
        themes: ['light', 'dark', 'pink'],
        valueMap: {pink: 'my-pink-theme'},
      });

    act(() => {
      render(
        <ThemeProvider>
          <ThemeReporter forceSetTheme="pink" />
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(
        document.documentElement.getAttribute(
          'data-theme',
        ),
      ).toBe('my-pink-theme');
      expect(
        document.documentElement.classList.contains(
          'my-pink-theme',
        ),
      ).toBe(true);
    });
  });

  test('ignores nested providers from the same binding', () => {
    const {ThemeProvider, useTheme} =
      createReactHarness({
        defaultTheme: 'dark',
      });

    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => (
        <ThemeProvider selectedTheme="dark">
          <ThemeProvider selectedTheme="light">
            {children}
          </ThemeProvider>
        </ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('applies and removes a forced theme', () => {
    setCookieValue('theme', 'dark');
    const {ThemeProvider, ThemeReporter} =
      createReactHarness();

    const {unmount} = render(
      <ThemeProvider forcedTheme="light">
        <ThemeReporter />
      </ThemeProvider>,
    );

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);

    unmount();

    render(
      <ThemeProvider>
        <ThemeReporter />
      </ThemeProvider>,
    );

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
    expect(
      screen.getByTestId('forcedTheme').textContent,
    ).toBe('');
    expect(
      screen.getByTestId('theme').textContent,
    ).toBe('dark');
  });

  test('treats compact system cookies as literal themes when system is disabled', () => {
    setCookieValue('theme', '~d');
    setDeviceTheme('light');
    const {makeWrapper, useTheme} = createReactHarness(
      {
        enableSystem: false,
        defaultTheme: 'light',
      },
    );

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.colorScheme).toBeUndefined();
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('supports setTheme updater functions', () => {
    const {makeWrapper, useTheme} = createReactHarness(
      {
        defaultTheme: 'light',
      },
    );
    const {result, rerender} = renderHook(
      () => useTheme(),
      {
        wrapper: makeWrapper(),
      },
    );
    const toggleTheme = vi.fn((theme: string) =>
      theme === 'light' ? 'dark' : 'light',
    );

    act(() => {
      result.current.setTheme(toggleTheme);
    });
    rerender();

    expect(toggleTheme).toHaveBeenCalledWith('light');
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });
});
