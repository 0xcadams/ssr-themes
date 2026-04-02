// @vitest-environment jsdom

import {describe, expect, test} from 'vitest';
import {
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

import {themeScript} from '../src/index';

installThemeTestEnv();

describe('bootstrap script', () => {
  test('themeScript inlines the bootstrap source', () => {
    const scriptContent = themeScript();

    expect(scriptContent).not.toContain(
      '__INLINE_THEME_SCRIPT__',
    );
    expect(scriptContent).not.toContain('toString');
    expect(scriptContent).not.toContain('\n');
  });

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

  test('themeScript treats compact cookies as literal themes when system is disabled', () => {
    setCookieValue('theme', '~d');
    setDeviceTheme('light');

    const scriptContent = themeScript({
      attribute: 'class',
      defaultTheme: 'light',
      enableSystem: false,
    });

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
    expect(
      document.documentElement.classList.contains(
        'system',
      ),
    ).toBeFalsy();
  });

  test('themeScript preserves an SSR-applied theme when no cookie is set', () => {
    setDeviceTheme('light');
    document.documentElement.classList.add('dark');

    const scriptContent = themeScript({
      attribute: 'class',
      defaultTheme: 'system',
    });

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });
});
