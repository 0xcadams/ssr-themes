import {
  getContext,
  hasContext,
  setContext,
} from 'svelte';
import type {ThemeContext} from './types.js';

const themeContextKey = Symbol('ssr-themes.svelte');

export const setThemeContext = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  context: ThemeContext<TTheme, TEnableSystem>,
) => setContext(themeContextKey, context);

export const maybeGetTheme = <
  TTheme extends string,
  TEnableSystem extends boolean,
>() =>
  hasContext(themeContextKey)
    ? getContext<ThemeContext<TTheme, TEnableSystem>>(
        themeContextKey,
      )
    : undefined;

export const useTheme = <
  TTheme extends string,
  TEnableSystem extends boolean,
>() => {
  const context = maybeGetTheme<
    TTheme,
    TEnableSystem
  >();
  if (!context) {
    throw new Error(
      'getTheme must be used within a ThemeProvider.',
    );
  }

  return context;
};

export const getTheme = useTheme;
