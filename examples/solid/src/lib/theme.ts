import {
  themeFromCookieHeader,
  type LightOrDark,
  type WithSystem,
} from 'ssr-themes';
import {getRequestEvent, isServer} from 'solid-js/web';

export const getInitialTheme = ():
  | WithSystem<LightOrDark>
  | undefined => {
  const cookieHeader = isServer
    ? getRequestEvent()?.request.headers.get('cookie')
    : document.cookie;

  return themeFromCookieHeader(cookieHeader);
};
