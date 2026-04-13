import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/svelte';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themeScriptPlaceholder =
  '%ssr-themes.script%';

const theme = createTheme();

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = theme;

export const {ThemeProvider, useTheme} =
  bindTheme(theme);

export const getThemeState = (
  cookieHeader: string | null | undefined,
) => parseThemeCookie(cookieHeader);

export const renderThemeHtmlAttributes = (
  themeState?: ReturnType<typeof getThemeState>,
) =>
  registerTheme(themeState, {
    renderMode: 'html-string',
  });

export const renderThemeScript = () => themeScript();
