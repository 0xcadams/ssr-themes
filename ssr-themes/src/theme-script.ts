import {script} from './script';
import {
  defaultThemes,
  getCookieName,
  resolveDefaultTheme,
} from './theme-runtime';
import type {LightOrDark, ThemeOptions} from './types';

export const themeScript = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  options: ThemeOptions<TTheme, TEnableSystem> = {},
) => {
  const {
    attribute = 'class',
    cookie,
    defaultTheme,
    enableColorScheme = true,
    forcedTheme,
    themes = defaultThemes as unknown as readonly TTheme[],
    valueMap,
    enableSystem,
  } = options;

  const enableSystemValue = (enableSystem ??
    true) as TEnableSystem;
  const resolvedDefaultTheme = resolveDefaultTheme<
    TTheme,
    TEnableSystem
  >(defaultTheme, enableSystemValue);
  const cookieName = getCookieName(cookie);
  const scriptArgs = JSON.stringify([
    attribute,
    cookieName,
    resolvedDefaultTheme,
    forcedTheme,
    themes,
    valueMap,
    enableSystemValue,
    enableColorScheme,
  ]).slice(1, -1);

  return `(${script.toString()})(${scriptArgs})`;
};
