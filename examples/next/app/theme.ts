import {createTheme} from 'ssr-themes';

export const theme = createTheme({
  defaultTheme: 'light',
});

export const {
  defaultVariant,
  decodeVariant,
  encodeVariant,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
  listVariants,
} = theme;
