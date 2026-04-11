import type {
  LightOrDark,
  ResolvedThemeState,
  ThemeOptions,
} from './types';
import {decodeThemeCookieValue} from './theme-cookie';

type ThemeFromCookieHeaderOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = {
  cookieName?: string;
  enableSystem?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['enableSystem'];
  themes?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['themes'];
};

export const parseThemeCookie = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  cookieHeader: string | null | undefined,
  options: ThemeFromCookieHeaderOptions<
    TTheme,
    TEnableSystem
  > = {},
):
  | ResolvedThemeState<TTheme, TEnableSystem>
  | undefined => {
  if (!cookieHeader) return undefined;

  const cookieName = options.cookieName ?? 'theme';
  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name !== cookieName) continue;

    let value: string;
    try {
      value = decodeURIComponent(rest.join('='));
    } catch {
      return undefined;
    }

    return decodeThemeCookieValue<
      TTheme,
      TEnableSystem
    >(value, {
      enableSystem: options.enableSystem,
      themes: options.themes,
    });
  }

  return undefined;
};
