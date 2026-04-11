// @vitest-environment jsdom

import {describe, expect, test} from 'vitest';
import {
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';
import {createTheme} from '../src/index';

installThemeTestEnv();

describe('bootstrap script', () => {
  test('themeScript inlines the bootstrap source', () => {
    const {themeScript} = createTheme();
    const scriptContent = themeScript();

    expect(scriptContent).not.toContain(
      '__INLINE_THEME_SCRIPT__',
    );
    expect(scriptContent).not.toContain('toString');
    expect(scriptContent).not.toContain('\n');
  });

  test('themeScript sets the html theme', () => {
    setCookieValue('theme', 'dark~l');

    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'light',
    });
    const scriptContent = themeScript();

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

    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'light',
    });
    const scriptContent = themeScript();

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });

  test('themeScript reads explicit themes with a color-scheme suffix', () => {
    setCookieValue('theme', 'dark~l');
    setDeviceTheme('light');

    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'light',
    });
    const scriptContent = themeScript();

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

    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'light',
      enableSystem: false,
    });
    const scriptContent = themeScript();

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

    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'system',
    });
    const scriptContent = themeScript();

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });

  test('themeScript supports forced runtime overrides', () => {
    const {themeScript} = createTheme({
      attribute: 'class',
      defaultTheme: 'light',
    });
    const scriptContent = themeScript({
      forced: 'dark',
    });

    Function(scriptContent)();

    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBeTruthy();
  });
});
