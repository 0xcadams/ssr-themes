import {
  createTheme,
  type ThemeOptionsFromBindInput,
  type ThemeState,
} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

import {expectType, type AssertEqual} from './assert';

const reactTheme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'quartz',
});

const reactBinding = bindTheme(reactTheme);
const reactBindingFromOptions = bindTheme({
  themes: ['day', 'night'],
  enableSystem: false,
  defaultTheme: 'day',
});

type ReactSelected = ReturnType<
  typeof reactBinding.useTheme
>['selected'];
type ReactProviderProps = Parameters<
  typeof reactBinding.ThemeProvider
>[0];
type ReactNoSystemSelected = ReturnType<
  typeof reactBindingFromOptions.useTheme
>['selected'];

expectType<
  AssertEqual<
    ThemeOptionsFromBindInput<typeof reactTheme>,
    typeof reactTheme.options
  >
>();
expectType<
  AssertEqual<
    ReactSelected,
    'light' | 'dark' | 'quartz' | 'system' | undefined
  >
>();
expectType<
  AssertEqual<
    ReactProviderProps['forced'],
    'light' | 'dark' | 'quartz' | undefined
  >
>();
expectType<
  AssertEqual<
    ReactProviderProps['initial'],
    | ThemeState<'light' | 'dark' | 'quartz', true>
    | undefined
  >
>();
expectType<
  AssertEqual<
    ReactNoSystemSelected,
    'day' | 'night' | undefined
  >
>();

const reactProviderProps = {
  forced: 'quartz',
  initial: {
    selected: 'system',
    resolved: 'dark',
  },
} satisfies ReactProviderProps;

const reactNoSystemProviderProps: Parameters<
  typeof reactBindingFromOptions.ThemeProvider
>[0] = {
  forced: 'day',
  initial: {
    selected: 'night',
    resolved: 'night',
  },
};

const invalidReactForced: ReactProviderProps = {
  // @ts-expect-error invalid forced theme should fail
  forced: 'sepia',
};

const invalidReactInitial: Parameters<
  typeof reactBindingFromOptions.ThemeProvider
>[0] = {
  initial: {
    // @ts-expect-error system should be removed when disabled
    selected: 'system',
    resolved: 'day',
  },
};

void reactProviderProps;
void reactNoSystemProviderProps;
void invalidReactForced;
void invalidReactInitial;
