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
import {createTheme} from '../src';
import {bindTheme} from '../src/react';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const createReactHarness = (
  options?: Parameters<typeof createTheme>[0],
) => {
  const theme = createTheme(options);
  const {ThemeProvider, useTheme} = bindTheme(theme);

  const ThemeReporter = ({
    forceSetTheme,
  }: {
    forceSetTheme?: string;
  }) => {
    const {
      setSelected,
      selected,
      forced,
      resolved,
      system,
    } = useTheme();

    React.useEffect(() => {
      if (forceSetTheme) {
        setSelected(forceSetTheme as never);
      }
    }, [forceSetTheme, setSelected]);

    return (
      <>
        <p data-testid="selected">{selected}</p>
        <p data-testid="forced">{forced}</p>
        <p data-testid="resolved">{resolved}</p>
        <p data-testid="system">{system}</p>
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
  test('infers literal theme tuples from createTheme without as const', () => {
    const theme = createTheme({
      themes: ['light', 'dark', 'quartz'],
    });
    const {useTheme} = bindTheme(theme);

    expectTypeOf<
      typeof theme.options.themes
    >().toEqualTypeOf<
      readonly ['light', 'dark', 'quartz']
    >();
    expectTypeOf<
      ReturnType<typeof useTheme>['selected']
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

    expect(result.current.selected).toBe('system');
    expect(result.current.system).toBe('dark');
    expect(result.current.resolved).toBe('dark');
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

  test('accepts spread theme state props', () => {
    setDeviceTheme('dark');
    const {makeWrapper, useTheme} =
      createReactHarness();

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({
        initial: {
          selected: 'light',
          resolved: 'light',
          system: 'dark',
        },
      }),
    });

    expect(result.current.selected).toBe('light');
    expect(result.current.system).toBe('dark');
    expect(result.current.resolved).toBe('light');
  });

  test('supports custom cookie names from createTheme', async () => {
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
        'light~l',
      );
    });
  });

  test('supports custom attributes and value maps from createTheme', async () => {
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
            {children}
          </ThemeProvider>
        </ThemeProvider>
      ),
    });

    expect(result.current.selected).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });

  test('throws when useTheme is used outside the provider', () => {
    const {useTheme} = createReactHarness();

    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });

  test('applies and removes a forced theme', () => {
    setCookieValue('theme', 'dark~l');
    const {ThemeProvider, ThemeReporter} =
      createReactHarness();

    const {unmount} = render(
      <ThemeProvider forced="light">
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
      screen.getByTestId('forced').textContent,
    ).toBe('');
    expect(
      screen.getByTestId('selected').textContent,
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

    expect(result.current.selected).toBe('dark');
    expect(result.current.system).toBe('light');
    expect(result.current.resolved).toBe('dark');
  });

  test('supports setSelected updater functions', () => {
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
      result.current.setSelected(toggleTheme);
    });
    rerender();

    expect(toggleTheme).toHaveBeenCalledWith('light');
    expect(result.current.selected).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });
});
