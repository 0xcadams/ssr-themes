import {
  themeFromCookieHeader,
  type LightOrDark,
  type ThemeCookieState,
} from 'ssr-themes';
import {getRequestEvent, isServer} from 'solid-js/web';

export const getThemeState = ():
  | ThemeCookieState<LightOrDark>
  | undefined => {
  const cookieHeader = isServer
    ? getRequestEvent()?.request.headers.get('cookie')
    : document.cookie;

  return themeFromCookieHeader(cookieHeader);
};
