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
      selected: 'system',
      forced: undefined,
      resolved: 'dark',
      system: 'dark',
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

  test('uses the provided initial state before start', () => {
    setDeviceTheme('light');

    const controller = createThemeController({
      initial: {
        selected: 'system',
        resolved: 'dark',
        system: 'dark',
      },
    });

    expect(controller.getSnapshot()).toEqual({
      selected: 'system',
      forced: undefined,
      resolved: 'dark',
      system: 'dark',
      themes: ['dark', 'light', 'system'],
    });
  });

  test('does not mutate the DOM when stopped before start', () => {
    document.documentElement.classList.add('light');

    const controller = createThemeController({
      forced: 'dark',
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

  test('updates snapshot and DOM when forced changes', () => {
    setCookieValue('theme', 'dark~l');

    const controller = createThemeController({});

    controller.start();
    controller.update({forced: 'light'});

    expect(controller.getSnapshot().forced).toBe(
      'light',
    );
    expect(controller.getSnapshot().resolved).toBe(
      'light',
    );
    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);

    controller.update({forced: undefined});

    expect(
      controller.getSnapshot().forced,
    ).toBeUndefined();
    expect(controller.getSnapshot().resolved).toBe(
      'dark',
    );
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
      selected: 'dark',
      forced: undefined,
      resolved: 'dark',
      system: 'dark',
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
    controller.setSelected('dark');

    expect(controller.getSnapshot().selected).toBe(
      'dark',
    );
    expect(controller.getSnapshot().resolved).toBe(
      'dark',
    );
    expect(getCookieValue('theme')).toBe('dark~l');
  });
});
