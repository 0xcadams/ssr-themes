import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const theme = initTheme({
  themes: ['light', 'dark', 'quartz', 'abyss'],
});

export const {
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(themeOptions);
