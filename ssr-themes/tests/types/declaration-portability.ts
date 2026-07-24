import {createTheme} from 'ssr-themes';
import {bindTheme as bindReactTheme} from 'ssr-themes/react';
import {bindTheme as bindSolidTheme} from 'ssr-themes/solid';
import {bindTheme as bindSvelteTheme} from 'ssr-themes/svelte';
import {bindTheme as bindVueTheme} from 'ssr-themes/vue';

export type {ThemeStyle} from 'ssr-themes';
export type {ThemeResult as ReactThemeResult} from 'ssr-themes/react';
export type {
  ThemeResult as SolidThemeResult,
  ThemeSetter as SolidThemeSetter,
} from 'ssr-themes/solid';
export type {
  SetThemeValue,
  ThemeContext,
} from 'ssr-themes/svelte';
export type {
  ThemeResult as VueThemeResult,
  ThemeSetter as VueThemeSetter,
} from 'ssr-themes/vue';

const theme = createTheme({
  themes: ['light', 'dark', 'custom'],
});

export const {
  decodeVariant,
  defaultVariant,
  encodeVariant,
  listVariants,
  options,
  parseThemeCookie,
  registerTheme,
  themeScript,
} = theme;

export const {
  ThemeProvider: ReactThemeProvider,
  useTheme: useReactTheme,
} = bindReactTheme(theme);

export const {
  ThemeProvider: SolidThemeProvider,
  useTheme: useSolidTheme,
} = bindSolidTheme(theme);

export const {
  ThemeProvider: SvelteThemeProvider,
  useTheme: useSvelteTheme,
} = bindSvelteTheme(theme);

export const {
  ThemeProvider: VueThemeProvider,
  useTheme: useVueTheme,
} = bindVueTheme(theme);
