import type {ComponentProps} from 'svelte';
import type {Readable} from 'svelte/store';
import {
  createTheme,
  type ThemeState,
} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/svelte';

import {expectType, type AssertEqual} from './assert';

const svelteTheme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'quartz',
});

const svelteBinding = bindTheme(svelteTheme);
const svelteNoSystemBinding = bindTheme({
  themes: ['day', 'night'],
  enableSystem: false,
  defaultTheme: 'day',
});

type SvelteSelected = ReturnType<
  typeof svelteBinding.useTheme
>['selected'];
type SvelteProviderProps = ComponentProps<
  typeof svelteBinding.ThemeProvider
>;
type SvelteNoSystemSelected = ReturnType<
  typeof svelteNoSystemBinding.useTheme
>['selected'];

expectType<
  AssertEqual<
    SvelteSelected,
    Readable<
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
    SvelteProviderProps['forced'],
    'light' | 'dark' | 'quartz' | undefined
  >
>();
expectType<
  AssertEqual<
    SvelteProviderProps['initial'],
    | ThemeState<'light' | 'dark' | 'quartz', true>
    | undefined
  >
>();
expectType<
  AssertEqual<
    SvelteNoSystemSelected,
    Readable<'day' | 'night' | undefined>
  >
>();

const svelteProviderProps = {
  forced: 'quartz',
  initial: {
    selected: 'system',
    resolved: 'dark',
  },
} satisfies SvelteProviderProps;

const invalidSvelteForced: SvelteProviderProps = {
  // @ts-expect-error invalid forced theme should fail
  forced: 'sepia',
};

const invalidSvelteInitial: ComponentProps<
  typeof svelteNoSystemBinding.ThemeProvider
> = {
  initial: {
    // @ts-expect-error system should be removed when disabled
    selected: 'system',
    resolved: 'day',
  },
};

void svelteProviderProps;
void invalidSvelteForced;
void invalidSvelteInitial;
