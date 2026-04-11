import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

const theme = createTheme();

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);
