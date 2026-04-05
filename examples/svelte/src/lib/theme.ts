import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/svelte';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themeScriptPlaceholder =
  '%ssr-themes.script%';

export const themes = ['dark', 'light'] as const;

const theme = initTheme({
  attribute: 'class' as const,
  themes,
});

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(options);

export const getThemeState = (
  cookieHeader: string | null | undefined,
) => themeFromCookieHeader(cookieHeader);

export const renderThemeHtmlAttributes = (
  themeState?: ReturnType<typeof getThemeState>,
) =>
  registerTheme(themeState, {
    renderMode: 'html-string',
  });

export const renderThemeScript = () => themeScript();
