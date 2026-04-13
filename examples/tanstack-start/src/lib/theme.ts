import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

export const theme = createTheme();

export const {
  defaultVariant,
  decodeVariant,
  encodeVariant,
  listVariants,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
