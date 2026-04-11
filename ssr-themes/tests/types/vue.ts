import type {Ref} from 'vue';
import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

import {expectType, type AssertEqual} from './assert';

const vueTheme = createTheme({
  themes: ['light', 'dark', 'quartz'],
  defaultTheme: 'quartz',
});

const vueBinding = bindTheme(vueTheme);
const vueNoSystemBinding = bindTheme({
  themes: ['day', 'night'],
  enableSystem: false,
  defaultTheme: 'day',
});

type VueSelected = ReturnType<
  typeof vueBinding.useTheme
>['selected'];
type VueNoSystemSelected = ReturnType<
  typeof vueNoSystemBinding.useTheme
>['selected'];

expectType<
  AssertEqual<
    VueSelected,
    Readonly<
      Ref<
        | 'light'
        | 'dark'
        | 'quartz'
        | 'system'
        | undefined
      >
    >
  >
>();
expectType<
  AssertEqual<
    VueNoSystemSelected,
    Readonly<Ref<'day' | 'night' | undefined>>
  >
>();
