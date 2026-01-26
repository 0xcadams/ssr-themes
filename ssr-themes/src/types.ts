import * as React from 'react';

export interface CookieOptions {
  /** Cookie name used to store theme preference */
  name?: string;
  /** Cookie path attribute */
  path?: string;
  /** Cookie max-age attribute in seconds */
  maxAge?: number;
  /** Cookie expires attribute */
  expires?: Date;
  /** Cookie SameSite attribute */
  sameSite?: 'lax' | 'strict' | 'none';
  /** Cookie domain attribute */
  domain?: string;
  /** Cookie secure attribute */
  secure?: boolean;
}

export type SystemThemeDefinition = readonly ['dark', 'light'];
export type SystemTheme = SystemThemeDefinition[number];

type DataAttribute = `data-${string}`;

export type Attribute = DataAttribute | 'class';

type ThemeValueMap<TTheme extends string> = Partial<Record<TTheme, string>>;

export type ThemeName<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = TEnableSystem extends true ? TTheme | 'system' : TTheme;

export interface ThemeOptions<
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
> {
  /** List of all available theme names */
  themes?: readonly TTheme[] | undefined;
  /** Forced theme name for the current page */
  forcedTheme?: TTheme | undefined;
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: TEnableSystem | undefined;
  /** Whether to indicate to browsers which color scheme is used */
  enableColorScheme?: boolean | undefined;
  /** Cookie configuration used to store theme preference */
  cookie?: CookieOptions | undefined;
  /** Default theme name (for v0.0.12 and lower the default was light). If `enableSystem` is false, the default theme is light */
  defaultTheme?: ThemeName<TTheme, TEnableSystem> | undefined;
  /** HTML attribute modified based on the active theme. Accepts `class`, `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.), or an array which could include both */
  attribute?: Attribute | Attribute[] | undefined;
  /** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
  value?: ThemeValueMap<TTheme> | undefined;
}

export interface UseThemeProps<
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
> {
  /** List of all available theme names */
  themes: ReadonlyArray<ThemeName<TTheme, TEnableSystem>>;
  /** Forced theme name for the current page */
  forcedTheme?: TTheme | undefined;
  /** Update the theme */
  setTheme: React.Dispatch<
    React.SetStateAction<ThemeName<TTheme, TEnableSystem>>
  >;
  /** Active theme name */
  theme?: ThemeName<TTheme, TEnableSystem> | undefined;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: Exclude<TTheme, 'system'> | undefined;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: TEnableSystem extends true ? SystemTheme : undefined;
}

export type ThemeHtmlProps = {
  className?: string;
  style?: React.CSSProperties;
} & Partial<Record<DataAttribute, string>>;

export interface RegisterThemeOptions<
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
> extends Pick<
  ThemeOptions<TTheme, TEnableSystem>,
  'attribute' | 'value' | 'enableColorScheme'
> {
  /** Resolved theme name to apply to the html element */
  theme?: TTheme | undefined;
  /** Optional class name to merge with the theme class */
  className?: string | undefined;
  /** Optional style object to merge with color-scheme */
  style?: React.CSSProperties | undefined;
}

export interface ThemeProviderProps<
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
>
  extends
    React.PropsWithChildren<unknown>,
    ThemeOptions<TTheme, TEnableSystem> {
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean | undefined;
  /** Theme name to use for server rendering */
  initialTheme?: ThemeName<TTheme, TEnableSystem> | undefined;
  /** Nonce string to pass to the inline style elements for CSP headers */
  nonce?: string;
}

export type ThemeScriptOptions<
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
> = ThemeOptions<TTheme, TEnableSystem>;
