import {script} from './script';
import type {
  LightOrDark,
  LightOrDarkTuple,
  ThemeOptions,
} from './types';

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
    themes = [
      'dark',
      'light',
    ] as const satisfies LightOrDarkTuple,
    valueMap,
    enableSystem,
  } = options;

  const enableSystemValue = enableSystem ?? true;
  const resolvedDefaultTheme =
    defaultTheme ??
    (enableSystemValue ? 'system' : 'light');
  const cookieName = cookie?.name ?? 'theme';
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
