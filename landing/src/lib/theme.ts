import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const theme = createTheme({
  themes: ['light', 'dark', 'quartz', 'abyss'],
  cookie: {
    secure: true,
  },
});

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
