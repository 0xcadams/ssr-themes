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
import {createTheme} from '../src';
import {bindTheme} from '../src/vue';
import {
  getCookieValue,
  installThemeTestEnv,
  setCookieValue,
  setDeviceTheme,
} from './helpers/theme-test-env';

installThemeTestEnv();

const wrappers: Array<VueWrapper<unknown>> = [];

const createVueHarness = (
  options?: Parameters<typeof createTheme>[0],
) => {
  const theme = createTheme(options);
  const {ThemeProvider, useTheme} = bindTheme(theme);

  const ThemeReporter = defineComponent({
    name: 'ThemeReporter',
    props: {
      forceSetTheme: String,
    },
    setup(props) {
      const theme = useTheme();

      watchEffect(() => {
        if (props.forceSetTheme) {
          theme.setSelected(
            props.forceSetTheme as never,
          );
        }
      });

      return () =>
        h('div', [
          h(
            'p',
            {'data-testid': 'selected'},
            theme.selected.value,
          ),
          h(
            'p',
            {'data-testid': 'forced'},
            theme.forced.value,
          ),
          h(
            'p',
            {'data-testid': 'resolved'},
            theme.resolved.value,
          ),
          h(
            'p',
            {'data-testid': 'system'},
            theme.system.value,
          ),
        ]);
    },
  });

  const renderTheme = (
    providerProps: Record<string, unknown> = {},
    reporterProps: {forceSetTheme?: string} = {},
  ) => {
    const wrapper = mount(
      defineComponent({
        name: 'ThemeHarness',
        setup() {
          return () =>
            h(ThemeProvider, providerProps as never, {
              default: () =>
                h(ThemeReporter, reporterProps),
            });
        },
      }),
    );

    wrappers.push(wrapper);

    return wrapper;
  };

  return {
    ThemeProvider,
    ThemeReporter,
    renderTheme,
  };
};

afterEach(() => {
  while (wrappers.length > 0) {
    wrappers.pop()?.unmount();
  }
});

describe('vue bindings', () => {
  test('uses the system theme by default', async () => {
    setDeviceTheme('dark');

    const {renderTheme} = createVueHarness();
    const wrapper = renderTheme();

    await nextTick();

    expect(
      wrapper.get('[data-testid="selected"]').text(),
    ).toBe('system');
    expect(
      wrapper.get('[data-testid="resolved"]').text(),
    ).toBe('dark');
    expect(
      wrapper.get('[data-testid="system"]').text(),
    ).toBe('dark');
  });

  test('persists the default system theme with a compact cookie value', async () => {
    setDeviceTheme('dark');

    const {renderTheme} = createVueHarness();
    renderTheme();

    await nextTick();

    expect(getCookieValue('theme')).toBe('~d');
  });

  test('accepts spread theme state props', async () => {
    setDeviceTheme('dark');

    const {renderTheme} = createVueHarness();
    const wrapper = renderTheme({
      initial: {
        selected: 'light',
        resolved: 'light',
        system: 'dark',
      },
    });

    await nextTick();

    expect(
      wrapper.get('[data-testid="selected"]').text(),
    ).toBe('light');
    expect(
      wrapper.get('[data-testid="resolved"]').text(),
    ).toBe('light');
    expect(
      wrapper.get('[data-testid="system"]').text(),
    ).toBe('dark');
  });

  test('updates the DOM and cookie when setting a theme', async () => {
    const {renderTheme} = createVueHarness();
    const wrapper = renderTheme(
      {},
      {forceSetTheme: 'dark'},
    );

    await nextTick();

    expect(
      wrapper.get('[data-testid="selected"]').text(),
    ).toBe('dark');
    expect(getCookieValue('theme')).toBe('dark~l');
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('supports custom attributes and value maps from createTheme', async () => {
    const {renderTheme} = createVueHarness({
      attribute: ['data-theme', 'class'],
      themes: ['light', 'dark', 'pink'],
      valueMap: {pink: 'night'},
    });

    renderTheme({}, {forceSetTheme: 'pink'});
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

  test('applies and removes a forced theme', async () => {
    setCookieValue('theme', 'dark~l');

    const {ThemeProvider, ThemeReporter} =
      createVueHarness();
    const forced = ref<string | undefined>('light');
    const wrapper = mount(
      defineComponent({
        name: 'ForcedThemeHarness',
        setup() {
          return () =>
            h(
              ThemeProvider,
              {forced: forced.value},
              {default: () => h(ThemeReporter)},
            );
        },
      }),
    );

    wrappers.push(wrapper);

    await nextTick();

    expect(
      wrapper.get('[data-testid="selected"]').text(),
    ).toBe('dark');
    expect(
      wrapper.get('[data-testid="forced"]').text(),
    ).toBe('light');
    expect(
      wrapper.get('[data-testid="resolved"]').text(),
    ).toBe('light');

    forced.value = undefined;
    await nextTick();

    expect(
      wrapper.get('[data-testid="forced"]').text(),
    ).toBe('');
    expect(
      document.documentElement.classList.contains(
        'dark',
      ),
    ).toBe(true);
  });

  test('ignores nested providers', async () => {
    const {ThemeProvider, ThemeReporter} =
      createVueHarness({
        defaultTheme: 'dark',
      });

    const wrapper = mount(
      defineComponent({
        name: 'NestedThemeHarness',
        setup() {
          return () =>
            h(
              ThemeProvider,
              {
                initial: {
                  selected: 'dark',
                  resolved: 'dark',
                },
              },
              {
                default: () =>
                  h(
                    ThemeProvider,
                    {
                      initial: {
                        selected: 'light',
                        resolved: 'light',
                      },
                    },
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
      wrapper.get('[data-testid="selected"]').text(),
    ).toBe('dark');
  });

  test('throws when useTheme is used outside the provider', () => {
    const {ThemeReporter} = createVueHarness();

    expect(() => mount(ThemeReporter)).toThrow(
      'useTheme must be used within a ThemeProvider.',
    );
  });
});
