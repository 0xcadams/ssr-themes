import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
  type LightOrDark,
  type ThemeCookieState,
} from 'ssr-themes';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themeScriptPlaceholder =
  '%ssr-themes.script%';

export const themes = ['dark', 'light'] as const;

export const themeConfig = {
  attribute: 'class' as const,
  themes,
};

export const getThemeState = (
  cookieHeader: string | null | undefined,
): ThemeCookieState<LightOrDark> | undefined =>
  themeFromCookieHeader(cookieHeader, {
    themes,
  });

export const renderThemeHtmlAttributes = (
  themeState?: ThemeCookieState<LightOrDark>,
) =>
  registerTheme({
    ...themeConfig,
    ...themeState,
    renderMode: 'html-string',
  });

export const renderThemeScript = () =>
  themeScript(themeConfig);
