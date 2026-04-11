import type {Accessor} from 'solid-js';
import {
  createTheme,
  type ThemeState,
} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/solid';

import {expectType, type AssertEqual} from './assert';

const solidTheme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'quartz',
});

const solidBinding = bindTheme(solidTheme);
const solidNoSystemBinding = bindTheme({
  themes: ['day', 'night'],
  enableSystem: false,
  defaultTheme: 'day',
});

type SolidSelected = ReturnType<
  typeof solidBinding.useTheme
>['selected'];
type SolidProviderProps = Parameters<
  typeof solidBinding.ThemeProvider
>[0];
type SolidNoSystemSelected = ReturnType<
  typeof solidNoSystemBinding.useTheme
>['selected'];

expectType<
  AssertEqual<
    SolidSelected,
    Accessor<
      | 'light'
      | 'dark'
      | 'quartz'
      | 'system'
      | undefined
    >
  >
>();
expectType<
  AssertEqual<
    SolidProviderProps['forced'],
    'light' | 'dark' | 'quartz' | undefined
  >
>();
expectType<
  AssertEqual<
    SolidProviderProps['initial'],
    | ThemeState<'light' | 'dark' | 'quartz', true>
    | undefined
  >
>();
expectType<
  AssertEqual<
    SolidNoSystemSelected,
    Accessor<'day' | 'night' | undefined>
  >
>();

const solidProviderProps = {
  forced: 'quartz',
  initial: {
    selected: 'system',
    resolved: 'dark',
  },
} satisfies SolidProviderProps;

const invalidSolidForced: SolidProviderProps = {
  // @ts-expect-error invalid forced theme should fail
  forced: 'sepia',
};

const invalidSolidInitial: Parameters<
  typeof solidNoSystemBinding.ThemeProvider
>[0] = {
  initial: {
    // @ts-expect-error system should be removed when disabled
    selected: 'system',
    resolved: 'day',
  },
};

void solidProviderProps;
void invalidSolidForced;
void invalidSolidInitial;
