import {
  afterAll,
  beforeAll,
  beforeEach,
  vi,
} from 'vitest';
import type {LightOrDark} from '../../src';

export type DeviceTheme = LightOrDark;

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

const clearThemeDom = () => {
  document.documentElement.className = '';
  document.documentElement.style.cssText = '';

  for (const {name} of Array.from(
    document.documentElement.attributes,
  )) {
    if (name.startsWith('data-')) {
      document.documentElement.removeAttribute(name);
    }
  }
};

export const setDeviceTheme = (theme: DeviceTheme) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
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
};

export const getCookieValue = (name: string) => {
  const value = cookieStore[name];

  return value ? decodeURIComponent(value) : null;
};

export const setCookieValue = (
  name: string,
  value: string,
) => {
  document.cookie = `${name}=${encodeURIComponent(value)}`;
};

export const installThemeTestEnv = () => {
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
    clearCookies();
    clearThemeDom();
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
};
