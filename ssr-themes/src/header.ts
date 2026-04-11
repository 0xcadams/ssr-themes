import type {
  AnyThemeOptions,
  EnableSystemFromOptions,
  LightOrDark,
  ResolvedThemeState,
  ThemeNameFromOptions,
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

type AnyThemeFromCookieHeaderOptions = {
  cookieName?: string;
} & Pick<AnyThemeOptions, 'themes' | 'enableSystem'>;

export function parseThemeCookie(
  cookieHeader: string | null | undefined,
): ResolvedThemeState<LightOrDark, true> | undefined;

export function parseThemeCookie<
  TEnableSystem extends boolean = true,
>(
  cookieHeader: string | null | undefined,
  options?: ThemeFromCookieHeaderOptions<
    LightOrDark,
    TEnableSystem
  >,
):
  | ResolvedThemeState<LightOrDark, TEnableSystem>
  | undefined;

export function parseThemeCookie<
  const TOptions extends ThemeFromCookieHeaderOptions<
    string,
    boolean
  >,
>(
  cookieHeader: string | null | undefined,
  options: TOptions,
):
  | ResolvedThemeState<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >
  | undefined;

export function parseThemeCookie<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  cookieHeader: string | null | undefined,
  options: ThemeFromCookieHeaderOptions<
    TTheme,
    TEnableSystem
  >,
):
  | ResolvedThemeState<TTheme, TEnableSystem>
  | undefined;

export function parseThemeCookie(
  cookieHeader: string | null | undefined,
  options: AnyThemeFromCookieHeaderOptions = {},
): ResolvedThemeState<string, boolean> | undefined {
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

    return decodeThemeCookieValue(value, {
      enableSystem: options.enableSystem,
      themes: options.themes,
    });
  }

  return undefined;
}
