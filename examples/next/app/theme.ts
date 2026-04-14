import {createTheme} from 'ssr-themes';

export const theme = createTheme();

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
