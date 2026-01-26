import {script} from './script';
import type {
  SystemTheme,
  SystemThemeDefinition,
  ThemeName,
  ThemeScriptOptions,
} from './types';

const defaultThemes = [
  'dark',
  'light',
] as const satisfies SystemThemeDefinition;

export const themeScript = <
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
>(
  options: ThemeScriptOptions<
    TTheme,
    TEnableSystem
  > = {},
) => {
  const {
    attribute = 'class',
    cookie,
    defaultTheme,
    enableColorScheme = true,
    forcedTheme,
    themes = defaultThemes,
    value,
    enableSystem,
  } = options;

  const enableSystemValue = (enableSystem ??
    true) as TEnableSystem;
  const resolvedDefaultTheme =
    defaultTheme ??
    ((enableSystemValue
      ? 'system'
      : 'light') as ThemeName<TTheme, TEnableSystem>);
  const cookieName = cookie?.name ?? 'theme';
  const scriptArgs = JSON.stringify([
    attribute,
    cookieName,
    resolvedDefaultTheme,
    forcedTheme,
    themes,
    value,
    enableSystemValue,
    enableColorScheme,
  ]).slice(1, -1);

  return `(${script.toString()})(${scriptArgs})`;
};
