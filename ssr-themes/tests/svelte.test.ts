// @vitest-environment jsdom

import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest';
import {get} from 'svelte/store';

import {createThemeController} from '../src/svelte/theme-state';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const controllers: Array<{
  destroy: () => void;
}> = [];

const createController = (
  options: Parameters<
    typeof createThemeController
  >[0] = {},
) => {
  const controller = createThemeController({
    disableTransitionOnChange: false,
    ...options,
  });

  controllers.push(controller);

  return controller;
};

afterEach(() => {
  while (controllers.length > 0) {
    controllers.pop()?.destroy();
  }
});

describe('svelte bindings', () => {
  test('uses the system theme by default', () => {
    setDeviceTheme('dark');

    const controller = createController();

    expect(get(controller.context.theme)).toBe(
      'system',
    );
    expect(get(controller.context.resolvedTheme)).toBe(
      'dark',
    );
    expect(get(controller.context.colorScheme)).toBe(
      'dark',
    );
    expect(get(controller.context.themes)).toEqual([
      'dark',
      'light',
      'system',
    ]);
  });

  test('persists the default system theme with a compact cookie value', () => {
    setDeviceTheme('dark');

    const controller = createController();

    controller.start();

    expect(getCookieValue('theme')).toBe('~d');
  });

  test('updates the DOM and cookie when setting a theme', () => {
    const controller = createController();

    controller.start();
    controller.context.setTheme('dark');

    expect(get(controller.context.theme)).toBe('dark');
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

  test('applies and removes a forced theme', () => {
    setCookieValue('theme', 'dark');

    const controller = createController({
      forcedTheme: 'light',
    });

    controller.start();

    expect(get(controller.context.theme)).toBe('dark');
    expect(get(controller.context.forcedTheme)).toBe(
      'light',
    );
    expect(get(controller.context.resolvedTheme)).toBe(
      'light',
    );
    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);

    controller.update({
      forcedTheme: undefined,
      disableTransitionOnChange: false,
    });

    expect(
      get(controller.context.forcedTheme),
    ).toBeUndefined();
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('supports custom attributes and value maps', () => {
    const controller = createController({
      attribute: ['data-theme', 'class'],
      valueMap: {dark: 'night'},
    });

    controller.start();
    controller.context.setTheme('dark');

    expect(
      document.documentElement.getAttribute(
        'data-theme',
      ),
    ).toBe('night');
    expect(
      document.documentElement.classList.contains(
        'night',
      ),
    ).toBe(true);
  });
});
