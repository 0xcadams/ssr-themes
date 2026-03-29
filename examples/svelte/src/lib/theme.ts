import {
  renderThemeAttributes,
  type LightOrDark,
  type WithSystem,
} from 'ssr-themes';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themes = ['dark', 'light'] as const;

export const themeConfig = {
  attribute: 'class' as const,
  enableColorScheme: true,
  themes,
};

export const parseThemeCookie = (
  value: string | undefined,
): WithSystem<LightOrDark> | undefined => {
  if (
    value === 'system' ||
    value === 'dark' ||
    value === 'light'
  ) {
    return value;
  }

  return undefined;
};

export const renderThemeHtmlAttributes = (
  initialTheme?: WithSystem<LightOrDark>,
) =>
  renderThemeAttributes({
    ...themeConfig,
    initialTheme,
  });
