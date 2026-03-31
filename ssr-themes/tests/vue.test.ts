// @vitest-environment jsdom

import {
  defineComponent,
  h,
  nextTick,
  ref,
  watchEffect,
} from 'vue';
import {mount, type VueWrapper} from '@vue/test-utils';
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest';

import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';
import {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
} from '../src/vue';

installThemeTestEnv();

const wrappers: Array<VueWrapper<unknown>> = [];

const ThemeReporter = defineComponent({
  name: 'ThemeReporter',
  props: {
    forceSetTheme: String,
  },
  setup(props) {
    const theme = useTheme<string, boolean>();

    watchEffect(() => {
      if (props.forceSetTheme) {
        theme.setTheme(props.forceSetTheme);
      }
    });

    return () =>
      h('div', [
        h(
          'p',
          {'data-testid': 'theme'},
          theme.theme.value,
        ),
        h(
          'p',
          {'data-testid': 'forcedTheme'},
          theme.forcedTheme.value,
        ),
        h(
          'p',
          {'data-testid': 'resolvedTheme'},
          theme.resolvedTheme.value,
        ),
        h(
          'p',
          {'data-testid': 'colorScheme'},
          theme.colorScheme.value,
        ),
      ]);
  },
});

const renderTheme = (
  providerProps: ThemeProviderProps<string, boolean>,
  reporterProps: {forceSetTheme?: string} = {},
) => {
  const wrapper = mount(
    defineComponent({
      name: 'ThemeHarness',
      setup() {
        return () =>
          h(ThemeProvider, providerProps, {
            default: () =>
              h(ThemeReporter, reporterProps),
          });
      },
    }),
  );

  wrappers.push(wrapper);

  return wrapper;
};

afterEach(() => {
  while (wrappers.length > 0) {
    wrappers.pop()?.unmount();
  }
});

describe('vue bindings', () => {
  test('uses the system theme by default', async () => {
    setDeviceTheme('dark');

    const wrapper = renderTheme({});

    await nextTick();

    expect(
      wrapper.get('[data-testid="theme"]').text(),
    ).toBe('system');
    expect(
      wrapper
        .get('[data-testid="resolvedTheme"]')
        .text(),
    ).toBe('dark');
    expect(
      wrapper
        .get('[data-testid="colorScheme"]')
        .text(),
    ).toBe('dark');
  });

  test('updates the DOM and cookie when setting a theme', async () => {
    const wrapper = renderTheme(
      {},
      {forceSetTheme: 'dark'},
    );

    await nextTick();

    expect(
      wrapper.get('[data-testid="theme"]').text(),
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

  test('applies and removes a forced theme', async () => {
    setCookieValue('theme', 'dark');

    const forcedTheme = ref<string | undefined>(
      'light',
    );
    const wrapper = mount(
      defineComponent({
        name: 'ForcedThemeHarness',
        setup() {
          return () =>
            h(
              ThemeProvider,
              {forcedTheme: forcedTheme.value},
              {default: () => h(ThemeReporter)},
            );
        },
      }),
    );

    wrappers.push(wrapper);

    await nextTick();

    expect(
      wrapper.get('[data-testid="theme"]').text(),
    ).toBe('dark');
    expect(
      wrapper
        .get('[data-testid="forcedTheme"]')
        .text(),
    ).toBe('light');
    expect(
      wrapper
        .get('[data-testid="resolvedTheme"]')
        .text(),
    ).toBe('light');
    expect(
      document.documentElement.classList.contains(
        'light',
      ),
    ).toBe(true);

    forcedTheme.value = undefined;
    await nextTick();

    expect(
      wrapper
        .get('[data-testid="forcedTheme"]')
        .text(),
    ).toBe('');
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('supports custom attributes and value maps', async () => {
    renderTheme(
      {
        attribute: ['data-theme', 'class'],
        valueMap: {dark: 'night'},
      },
      {forceSetTheme: 'dark'},
    );

    await nextTick();

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

  test('ignores nested providers', async () => {
    const wrapper = mount(
      defineComponent({
        name: 'NestedThemeHarness',
        setup() {
          return () =>
            h(
              ThemeProvider,
              {defaultTheme: 'dark'},
              {
                default: () =>
                  h(
                    ThemeProvider,
                    {defaultTheme: 'light'},
                    {default: () => h(ThemeReporter)},
                  ),
              },
            );
        },
      }),
    );

    wrappers.push(wrapper);
    await nextTick();

    expect(
      wrapper.get('[data-testid="theme"]').text(),
    ).toBe('dark');
  });

  test('throws when useTheme is used outside the provider', () => {
    expect(() => mount(ThemeReporter)).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });
});
