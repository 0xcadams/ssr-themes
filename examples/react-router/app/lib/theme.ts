import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const theme = createTheme({
  cookie: {
    secure: true,
  },
});

export const {
  parseThemeCookie,
  registerTheme,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
