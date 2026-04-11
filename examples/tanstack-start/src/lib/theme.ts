import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const theme = initTheme();

export const {
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(themeOptions);
