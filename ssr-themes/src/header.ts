import type {
  LightOrDark,
  WithSystem,
  ThemeOptions,
} from './types';

type ThemeFromCookieHeaderOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = {
  cookieName?: string;
  themes?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['themes'];
};

export const themeFromCookieHeader = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  cookieHeader: string | null | undefined,
  options: ThemeFromCookieHeaderOptions<
    TTheme,
    TEnableSystem
  > = {},
): WithSystem<TTheme, TEnableSystem> | undefined => {
  if (!cookieHeader) return undefined;

  const cookieName = options.cookieName ?? 'theme';
  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name !== cookieName) continue;

    let value: string;
    try {
      value = decodeURIComponent(rest.join('='));
    } catch (error) {
      return undefined;
    }

    if (!value) return undefined;

    if (
      options.themes &&
      value !== 'system' &&
      !options.themes.includes(value as TTheme)
    ) {
      return undefined;
    }

    return value as WithSystem<TTheme, TEnableSystem>;
  }

  return undefined;
};
