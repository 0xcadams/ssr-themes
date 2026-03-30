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
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
} from '../src/solid';

let originalCookieDescriptor:
  | PropertyDescriptor
  | undefined;
let cookieStore: Record<string, string> = {};

const serializeCookies = () =>
  Object.entries(cookieStore)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

const setMockCookie = (cookie: string) => {
  const [pair = ''] = cookie.split(';');
  const [rawName = '', ...rawValueParts] =
    pair.split('=');
  const name = rawName.trim();
  if (!name) return;
  const value = rawValueParts.join('=').trim();
  cookieStore[name] = value;
};

const clearCookies = () => {
  cookieStore = {};
};

const getCookieValue = (name: string) => {
  const value = cookieStore[name];
  return value ? decodeURIComponent(value) : null;
};

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

function setDeviceTheme(theme: 'light' | 'dark') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: theme === 'dark',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeAll(() => {
  originalCookieDescriptor =
    Object.getOwnPropertyDescriptor(
      document,
      'cookie',
    ) ??
    Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie',
    );

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => serializeCookies(),
    set: value => {
      setMockCookie(value);
    },
  });
});

beforeEach(() => {
  setDeviceTheme('light');
  document.documentElement.style.colorScheme = '';
  document.documentElement.removeAttribute(
    'data-theme',
  );
  document.documentElement.removeAttribute('class');
  clearCookies();
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  if (originalCookieDescriptor) {
    Object.defineProperty(
      document,
      'cookie',
      originalCookieDescriptor,
    );
  }
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
