// @vitest-environment jsdom

import * as React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  vi,
  afterEach,
  describe,
  test,
  it,
  expect,
} from 'vitest';
import {cleanup} from '@testing-library/react';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

import {
  ThemeProvider,
  type ThemeProviderProps,
  useTheme,
} from '../src/react';
import {themeScript} from '../src/index';

installThemeTestEnv();

// HelperComponent to render the theme inside a paragraph-tag and setting a theme via the forceSetTheme prop
const HelperComponent = ({
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
  } = useTheme<string, boolean>();

  React.useEffect(() => {
    if (forceSetTheme) {
      setTheme(forceSetTheme);
    }
  }, [forceSetTheme]);

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

afterEach(() => {
  cleanup();
});

function makeWrapper(
  props: ThemeProviderProps<string, boolean>,
) {
  return ({children}: {children: React.ReactNode}) => (
    <ThemeProvider {...props}>
      {children}
    </ThemeProvider>
  );
}

describe('defaultTheme', () => {
  test('should return system-theme when no default-theme is set', () => {
    setDeviceTheme('light');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });
    expect(result.current.theme).toBe('system');
    expect(result.current.colorScheme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  test('should return light when no default-theme is set and enableSystem=false', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({enableSystem: false}),
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  test('should return light when light is set as default-theme', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({defaultTheme: 'light'}),
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  test('should return dark when dark is set as default-theme', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({defaultTheme: 'dark'}),
    });
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });
});

describe('provider', () => {
  it('ignores nested ThemeProviders', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => (
        <ThemeProvider defaultTheme="dark">
          <ThemeProvider defaultTheme="light">
            {children}
          </ThemeProvider>
        </ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });
});

describe('storage', () => {
  test('should not set cookie with default value', () => {
    renderHook(() => useTheme(), {
      wrapper: makeWrapper({defaultTheme: 'dark'}),
    });

    expect(getCookieValue('theme')).toBeNull();
  });

  test('should set cookie when switching themes', () => {
    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });
    result.current.setTheme('dark');

    expect(getCookieValue('theme')).toBe('dark');
  });

  test('should encode system theme when switching themes', () => {
    setDeviceTheme('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({enableSystem: true}),
    });
    result.current.setTheme('system');

    expect(getCookieValue('theme')).toBe('~d');
  });
});

describe('custom cookie name', () => {
  test("should save to cookie with 'theme' name when using default settings", async () => {
    act(() => {
      render(
        <ThemeProvider>
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(getCookieValue('theme')).toBe('light');
    });
  });

  test("should save to cookie with 'customKey' when setting prop 'cookie.name' to 'customKey'", async () => {
    act(() => {
      render(
        <ThemeProvider cookie={{name: 'customKey'}}>
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(getCookieValue('customKey')).toBe(
        'light',
      );
    });
  });
});

describe('html theme precedence', () => {
  test('should not prefer existing html theme when attribute is present', () => {
    document.documentElement.classList.add('dark');
    setCookieValue('theme', 'light');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.theme).toBe('light');
  });
});

describe('custom attribute', () => {
  test('should use class attribute when using default', () => {
    act(() => {
      render(
        <ThemeProvider>
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBeTruthy();
  });

  test('should use class attribute (CSS-class) when attribute="class"', () => {
    act(() => {
      render(
        <ThemeProvider attribute="class">
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBeTruthy();
  });

  test('should use "data-example"-attribute when attribute="data-example"', () => {
    act(() => {
      render(
        <ThemeProvider attribute="data-example">
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.getAttribute(
        'data-example',
      ),
    ).toBe('light');
  });

  test('supports multiple attributes', () => {
    act(() => {
      render(
        <ThemeProvider
          attribute={[
            'data-example',
            'data-theme-test',
          ]}
        >
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.getAttribute(
        'data-example',
      ),
    ).toBe('light');
    expect(
      document.documentElement.getAttribute(
        'data-theme-test',
      ),
    ).toBe('light');
  });
});

describe('custom value-mapping', () => {
  test('should use custom value mapping when using value={{pink:"my-pink-theme"}}', () => {
    setCookieValue('theme', 'pink');

    act(() => {
      render(
        <ThemeProvider
          themes={['pink', 'light', 'dark', 'system']}
          valueMap={{pink: 'my-pink-theme'}}
        >
          <HelperComponent forceSetTheme="pink" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'my-pink-theme',
      ),
    ).toBeTruthy();
    expect(getCookieValue('theme')).toBe('pink');
  });

  test('should allow missing values (attribute)', () => {
    act(() => {
      render(
        <ThemeProvider valueMap={{dark: 'dark-mode'}}>
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(document.documentElement.className).toBe(
      '',
    );
  });

  test('should allow missing values (class)', () => {
    act(() => {
      render(
        <ThemeProvider
          attribute="class"
          valueMap={{dark: 'dark-mode'}}
        >
          <HelperComponent forceSetTheme="light" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBeFalsy();
  });

  test('supports multiple attributes', () => {
    act(() => {
      render(
        <ThemeProvider
          attribute={[
            'data-example',
            'data-theme-test',
          ]}
          themes={['pink', 'light', 'dark', 'system']}
          valueMap={{pink: 'my-pink-theme'}}
        >
          <HelperComponent forceSetTheme="pink" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.getAttribute(
        'data-example',
      ),
    ).toBe('my-pink-theme');
    expect(
      document.documentElement.getAttribute(
        'data-theme-test',
      ),
    ).toBe('my-pink-theme');
  });
});

describe('forcedTheme', () => {
  test('should render saved theme when no forcedTheme is set', () => {
    setCookieValue('theme', 'dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.forcedTheme).toBeUndefined();
  });

  test('should render light theme when forcedTheme is set to light', () => {
    setCookieValue('theme', 'dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({
        forcedTheme: 'light',
      }),
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.forcedTheme).toBe('light');
  });

  test('should restore theme after forcedTheme unmounts', () => {
    setCookieValue('theme', 'dark');

    const {unmount} = render(
      <ThemeProvider forcedTheme="light">
        <HelperComponent />
      </ThemeProvider>,
    );

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBeTruthy();

    unmount();

    render(
      <ThemeProvider>
        <HelperComponent />
      </ThemeProvider>,
    );

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
    expect(
      screen.getByTestId('forcedTheme').textContent,
    ).toBe('');
    expect(
      screen.getByTestId('theme').textContent,
    ).toBe('dark');
  });
});

describe('system theme', () => {
  test('resolved theme should be set', () => {
    setDeviceTheme('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.forcedTheme).toBeUndefined();
  });

  test('system theme should be set, even if theme is not system', () => {
    setDeviceTheme('dark');

    act(() => {
      render(
        <ThemeProvider defaultTheme="light">
          <HelperComponent />
        </ThemeProvider>,
      );
    });

    expect(
      screen.getByTestId('theme').textContent,
    ).toBe('light');
    expect(
      screen.getByTestId('forcedTheme').textContent,
    ).toBe('');
    expect(
      screen.getByTestId('resolvedTheme').textContent,
    ).toBe('light');
    expect(
      screen.getByTestId('colorScheme').textContent,
    ).toBe('dark');
  });

  test('system theme should not be set if enableSystem is false', () => {
    setDeviceTheme('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({
        enableSystem: false,
        defaultTheme: 'light',
      }),
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.colorScheme).toBeUndefined();
    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.forcedTheme).toBeUndefined();
  });

  test('should keep system theme when dom is resolved', () => {
    setDeviceTheme('dark');
    setCookieValue('theme', '~d');
    document.documentElement.classList.add('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('should prefer system default over resolved dom theme', () => {
    setDeviceTheme('dark');
    document.documentElement.classList.add('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({}),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('should keep selectedTheme when dom is already resolved', () => {
    setDeviceTheme('dark');
    document.documentElement.classList.add('dark');

    const {result} = renderHook(() => useTheme(), {
      wrapper: makeWrapper({selectedTheme: 'system'}),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });
});

describe('color-scheme', () => {
  test('does not set color-scheme when disabled', () => {
    act(() => {
      render(
        <ThemeProvider enableColorScheme={false}>
          <HelperComponent />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.style.colorScheme,
    ).toBe('');
  });

  test('should set color-scheme light when light theme is active', () => {
    act(() => {
      render(
        <ThemeProvider>
          <HelperComponent />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBeTruthy();
    expect(
      document.documentElement.style.colorScheme,
    ).toBe('light');
  });

  test('should set color-scheme dark when dark theme is active', () => {
    act(() => {
      render(
        <ThemeProvider defaultTheme="dark">
          <HelperComponent forceSetTheme="dark" />
        </ThemeProvider>,
      );
    });

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
    expect(
      document.documentElement.style.colorScheme,
    ).toBe('dark');
  });
});

describe('setTheme', () => {
  test('setTheme(<literal>)', () => {
    const {result, rerender} = renderHook(
      () => useTheme(),
      {
        wrapper: ({children}) => (
          <ThemeProvider defaultTheme="light">
            {children}
          </ThemeProvider>
        ),
      },
    );
    expect(result.current?.setTheme).toBeDefined();
    expect(result.current.resolvedTheme).toBe('light');
    result.current.setTheme('dark');
    rerender();
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('setTheme(<function>)', () => {
    const {result, rerender} = renderHook(
      () => useTheme(),
      {
        wrapper: ({children}) => (
          <ThemeProvider defaultTheme="light">
            {children}
          </ThemeProvider>
        ),
      },
    );
    expect(result.current?.setTheme).toBeDefined();
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');

    const toggleTheme = vi.fn((theme: string) =>
      theme === 'light' ? 'dark' : 'light',
    );

    act(() => {
      result.current.setTheme(toggleTheme);
    });
    expect(toggleTheme).toBeCalledTimes(1);
    rerender();

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
      result.current.setTheme(toggleTheme);
    });
    expect(toggleTheme).toBeCalledTimes(2);
    rerender();

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  test('setTheme(<function>) gets relevant state value', () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    const {result} = renderHook(() => useTheme(), {
      wrapper: ({children}) => (
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      ),
    });

    act(() => {
      result.current.setTheme(theme => {
        console.log('1', theme);
        return theme === 'dark' ? 'light' : 'dark';
      });
      result.current.setTheme(theme => {
        console.log('2', theme);
        return theme === 'light' ? 'dark' : 'light';
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '1',
      'light',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '2',
      'dark',
    );
    expect(result.current.theme).toBe('light');

    consoleSpy.mockRestore();
  });
});

describe('bootstrap script', () => {
  test('themeScript sets the html theme', () => {
    setCookieValue('theme', 'dark');

    const scriptContent = themeScript({
      attribute: 'class',
      defaultTheme: 'light',
    });

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });

  test('themeScript prefers the compact cookie over stale dom', () => {
    setCookieValue('theme', '~d');
    setDeviceTheme('dark');
    document.documentElement.classList.add('light');

    const scriptContent = themeScript({
      attribute: 'class',
      defaultTheme: 'light',
    });

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });
});
