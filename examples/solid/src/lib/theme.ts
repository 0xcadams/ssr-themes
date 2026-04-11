import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/solid';
import {getRequestEvent, isServer} from 'solid-js/web';

const theme = initTheme();

export const {
  themeOptions,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(themeOptions);

export const getThemeState = () => {
  const cookieHeader = isServer
    ? getRequestEvent()?.request.headers.get('cookie')
    : document.cookie;

  return themeFromCookieHeader(cookieHeader);
};
