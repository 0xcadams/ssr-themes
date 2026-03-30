// @vitest-environment jsdom

import {createComponent, createEffect} from 'solid-js';
import {render} from 'solid-js/web';
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
const cleanups = new Set<() => void>();

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

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const queryByTestId = (
  container: HTMLElement,
  id: string,
) => container.querySelector(`[data-testid="${id}"]`);

const ThemeReporter = (props: {
  forceSetTheme?: string;
}) => {
  const theme = useTheme<string, boolean>();
  const root = document.createElement('div');
  const themeNode = document.createElement('p');
  const forcedThemeNode = document.createElement('p');
  const resolvedThemeNode =
    document.createElement('p');
  const colorSchemeNode = document.createElement('p');
  themeNode.dataset.testid = 'theme';
  forcedThemeNode.dataset.testid = 'forcedTheme';
  resolvedThemeNode.dataset.testid = 'resolvedTheme';
  colorSchemeNode.dataset.testid = 'colorScheme';
  root.append(
    themeNode,
    forcedThemeNode,
    resolvedThemeNode,
    colorSchemeNode,
  );

  createEffect(() => {
    themeNode.textContent = theme.theme() ?? '';
    forcedThemeNode.textContent =
      theme.forcedTheme() ?? '';
    resolvedThemeNode.textContent =
      theme.resolvedTheme() ?? '';
    colorSchemeNode.textContent =
      theme.colorScheme() ?? '';
  });

  createEffect(() => {
    if (props.forceSetTheme) {
      theme.setTheme(props.forceSetTheme);
    }
  });

  return root;
};

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

function mountTheme(
  props: ThemeProviderProps<string, boolean>,
  reporterProps: {forceSetTheme?: string} = {},
) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const cleanup = render(
    () =>
      createComponent(ThemeProvider, {
        ...props,
        get children() {
          return createComponent(
            ThemeReporter,
            reporterProps,
          );
        },
      }),
    container,
  );
  const dispose = () => {
    cleanup();
    container.remove();
  };
  cleanups.add(dispose);

  return {
    container,
    dispose() {
      cleanups.delete(dispose);
      dispose();
    },
  };
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
  for (const cleanup of cleanups) {
    cleanup();
  }
  cleanups.clear();
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
    const {container} = mountTheme({});

    await flush();

    expect(
      queryByTestId(container, 'theme')?.textContent,
    ).toBe('system');
    expect(
      queryByTestId(container, 'resolvedTheme')
        ?.textContent,
    ).toBe('dark');
    expect(
      queryByTestId(container, 'colorScheme')
        ?.textContent,
    ).toBe('dark');
  });

  test('updates the DOM and cookie when setting a theme', async () => {
    const {container} = mountTheme(
      {},
      {forceSetTheme: 'dark'},
    );

    await flush();

    expect(
      queryByTestId(container, 'theme')?.textContent,
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

  test('ignores nested providers', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const cleanup = render(
      () =>
        createComponent(ThemeProvider, {
          defaultTheme: 'dark',
          get children() {
            return createComponent(ThemeProvider, {
              defaultTheme: 'light',
              get children() {
                return createComponent(
                  ThemeReporter,
                  {},
                );
              },
            });
          },
        }),
      container,
    );
    const dispose = () => {
      cleanup();
      container.remove();
    };
    cleanups.add(dispose);

    await flush();

    expect(
      queryByTestId(container, 'theme')?.textContent,
    ).toBe('dark');
  });

  test('throws when useTheme is used outside the provider', () => {
    const container = document.createElement('div');

    expect(() =>
      render(
        () => createComponent(ThemeReporter, {}),
        container,
      ),
    ).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });
});
