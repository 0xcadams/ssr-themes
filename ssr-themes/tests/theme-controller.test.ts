// @vitest-environment jsdom

import {describe, expect, test, vi} from 'vitest';
import {createThemeController} from '../src/theme-controller';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

describe('theme controller', () => {
  test('derives the default system snapshot', () => {
    setDeviceTheme('dark');

    const controller = createThemeController<
      'light' | 'dark',
      boolean
    >({});

    expect(controller.getSnapshot()).toEqual({
      theme: 'system',
      forcedTheme: undefined,
      resolvedTheme: 'dark',
      colorScheme: 'dark',
      themes: ['dark', 'light', 'system'],
    });
  });

  test('persists the default system theme when started', () => {
    setDeviceTheme('dark');

    const controller = createThemeController<
      'light' | 'dark',
      boolean
    >({});

    controller.start();

    expect(getCookieValue('theme')).toBe('~d');
  });

  test('publishes once when started', () => {
    setDeviceTheme('dark');

    const controller = createThemeController<
      'light' | 'dark',
      boolean
    >({});
    const listener = vi.fn();

    controller.subscribe(listener);
    controller.start();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('does not mutate the DOM when stopped before start', () => {
    document.documentElement.classList.add('light');

    const controller = createThemeController({
      forcedTheme: 'dark',
    });

    controller.stop();

    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(false);
  });

  test('updates snapshot and DOM when forcedTheme changes', () => {
    setCookieValue('theme', 'dark');

    const controller = createThemeController({});

    controller.start();
    controller.update({forcedTheme: 'light'});

    expect(controller.getSnapshot().forcedTheme).toBe(
      'light',
    );
    expect(
      controller.getSnapshot().resolvedTheme,
    ).toBe('light');
    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);

    controller.update({forcedTheme: undefined});

    expect(
      controller.getSnapshot().forcedTheme,
    ).toBeUndefined();
    expect(
      controller.getSnapshot().resolvedTheme,
    ).toBe('dark');
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('coerces the active theme when system support is disabled', () => {
    setDeviceTheme('dark');

    const controller = createThemeController<
      'light' | 'dark',
      boolean
    >({});

    controller.start();
    controller.update({
      defaultTheme: 'light',
      enableSystem: false,
    });

    expect(controller.getSnapshot()).toEqual({
      theme: 'dark',
      forcedTheme: undefined,
      resolvedTheme: 'dark',
      colorScheme: undefined,
      themes: ['dark', 'light'],
    });
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('writes explicit theme changes through the shared setter', () => {
    const controller = createThemeController<
      'light' | 'dark'
    >({
      defaultTheme: 'light',
    });

    controller.start();
    controller.setTheme('dark');

    expect(controller.getSnapshot().theme).toBe(
      'dark',
    );
    expect(
      controller.getSnapshot().resolvedTheme,
    ).toBe('dark');
    expect(getCookieValue('theme')).toBe('dark');
  });
});
