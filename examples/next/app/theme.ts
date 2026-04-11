import {initTheme} from 'ssr-themes';

export const theme = initTheme({
  defaultTheme: 'light',
});

export const {
  decodeTheme,
  encodeTheme,
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
  themeVariants,
} = theme;

export const defaultThemeState = {
  selectedTheme: 'light',
  appliedTheme: 'light',
  colorScheme: 'dark',
} as const;

export const defaultThemeVariant =
  encodeTheme(defaultThemeState) ?? 'light';
