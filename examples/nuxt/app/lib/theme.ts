import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

const theme = initTheme();

export const {
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(themeOptions);
