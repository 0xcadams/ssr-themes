import {getContext, setContext} from 'svelte';

import type {ThemeContext} from './types.js';

const themeContextKey = Symbol('ssr-themes.svelte');

export const setThemeContext = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  context: ThemeContext<TTheme, TEnableSystem>,
) => setContext(themeContextKey, context);

export const getTheme = <
  TTheme extends string,
  TEnableSystem extends boolean,
>() =>
  getContext<ThemeContext<TTheme, TEnableSystem>>(
    themeContextKey,
  );
