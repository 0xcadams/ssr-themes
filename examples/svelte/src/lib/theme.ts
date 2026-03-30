import {
  renderThemeAttributes,
  themeFromCookieHeader,
  type LightOrDark,
  type WithSystem,
} from 'ssr-themes';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themes = ['dark', 'light'] as const;

export const themeConfig = {
  attribute: 'class' as const,
  themes,
};

export const getInitialTheme = (
  cookieHeader: string | null | undefined,
): WithSystem<LightOrDark> | undefined =>
  themeFromCookieHeader(cookieHeader, {
    themes,
  });

export const renderThemeHtmlAttributes = (
  initialTheme?: WithSystem<LightOrDark>,
) =>
  renderThemeAttributes({
    ...themeConfig,
    initialTheme,
  });
