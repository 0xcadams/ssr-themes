import {
  defaultThemes,
  getCookieName,
  resolveDefaultTheme,
} from './theme-runtime';
import type {
  LightOrDark,
  ThemeOptions,
  ThemeScriptRuntimeOptions,
} from './types';

type ThemeScriptOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = ThemeOptions<TTheme, TEnableSystem> &
  ThemeScriptRuntimeOptions<TTheme>;

type DefaultThemeScriptOptions<
  TEnableSystem extends boolean = true,
> = ThemeScriptOptions<LightOrDark, TEnableSystem>;

type CustomThemeScriptOptions<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = Omit<
  ThemeScriptOptions<TTheme, TEnableSystem>,
  'themes'
> & {
  themes: readonly TTheme[];
};

const inlineScriptSource = '__INLINE_THEME_SCRIPT__';

export function themeScript(): string;

export function themeScript<
  TEnableSystem extends boolean = true,
>(
  options?: DefaultThemeScriptOptions<TEnableSystem>,
): string;

export function themeScript<
  const TOptions extends CustomThemeScriptOptions<
    string,
    boolean
  >,
>(options: TOptions): string;

export function themeScript(
  options: ThemeScriptOptions<string, boolean>,
): string;

export function themeScript(
  options: ThemeScriptOptions<string, boolean> = {},
) {
  const {
    attribute = 'class',
    cookie,
    defaultTheme,
    enableColorScheme = true,
    forced,
    valueMap,
    enableSystem,
  } = options;
  const themes = options.themes ?? defaultThemes;

  const enableSystemValue = enableSystem ?? true;
  const resolvedDefaultTheme = resolveDefaultTheme(
    defaultTheme,
    enableSystemValue,
  );
  const cookieName = getCookieName(cookie);
  const scriptArgs = JSON.stringify([
    attribute,
    cookieName,
    resolvedDefaultTheme,
    forced,
    themes,
    valueMap,
    enableSystemValue,
    enableColorScheme,
  ]).slice(1, -1);

  return `(${inlineScriptSource})(${scriptArgs})`;
}
