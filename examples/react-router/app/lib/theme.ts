import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const theme = createTheme({
  cookie: {
    secure: true,
  },
});

export const {
  encodeVariant,
  parseThemeCookie,
  registerTheme,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
