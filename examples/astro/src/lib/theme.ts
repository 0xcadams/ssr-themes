import {initTheme} from 'ssr-themes';

const theme = initTheme();

export const {
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;
