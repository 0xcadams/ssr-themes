import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/solid';
import {getRequestEvent, isServer} from 'solid-js/web';

const theme = createTheme({
  cookie: {
    secure: true,
  },
});

export const {
  encodeVariant,
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);

export const getThemeState = () => {
  const cookieHeader = isServer
    ? getRequestEvent()?.request.headers.get('cookie')
    : document.cookie;

  return parseThemeCookie(cookieHeader);
};
