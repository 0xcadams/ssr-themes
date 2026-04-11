import {createTheme} from 'ssr-themes';

export const theme = createTheme({
  defaultTheme: 'light',
});

export const {
  decodeVariant,
  encodeVariant,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
  listVariants,
} = theme;

export const defaultThemeState = {
  selected: 'light',
  resolved: 'light',
  system: 'dark',
} as const;

export const defaultThemeVariant =
  encodeVariant(defaultThemeState) ?? 'light~l';
