import * as React from 'react';

interface ValueObject {
  [themeName: string]: string;
}

export interface CookieOptions {
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

export interface CookieConfig extends CookieOptions {
  /** Cookie name used to store theme preference */
  name?: string;
}

export type SystemThemeDefinition = readonly ['dark', 'light'];
export type SystemTheme = SystemThemeDefinition[number];
export type DefaultTheme = SystemTheme | 'system';

type DataAttribute = `data-${string}`;

interface ScriptProps extends React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
> {
  [dataAttribute: DataAttribute]: any;
}

export interface UseThemeProps<
  TThemes extends readonly string[] = SystemThemeDefinition,
> {
  /** List of all available theme names */
  themes: TThemes;
  /** Forced theme name for the current page */
  forcedTheme?: ThemeName<TThemes> | undefined;
  /** Update the theme */
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  /** Active theme name */
  theme?: ThemeName<TThemes> | undefined;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: ThemeName<TThemes> | undefined;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: SystemTheme | undefined;
}

export type Attribute = DataAttribute | 'class';

export type ThemeName<T extends readonly string[]> = T[number];

export type ThemeHtmlProps = {
  className?: string;
  style?: React.CSSProperties;
} & Partial<Record<DataAttribute, string>>;

export interface RegisterThemeOptions<
  TThemes extends readonly string[] = SystemThemeDefinition,
> {
  /** Resolved theme name to apply to the html element */
  theme?: ThemeName<TThemes> | undefined;
  /** HTML attribute modified based on the active theme */
  attribute?: Attribute | Attribute[] | undefined;
  /** Mapping of theme name to HTML attribute value */
  value?: ValueObject | undefined;
  /** Whether to indicate to browsers which color scheme is used */
  enableColorScheme?: boolean | undefined;
  /** Optional class name to merge with the theme class */
  className?: string | undefined;
  /** Optional style object to merge with color-scheme */
  style?: React.CSSProperties | undefined;
}

export interface ThemeProviderProps<
  TThemes extends readonly string[] = SystemThemeDefinition,
> extends React.PropsWithChildren<unknown> {
  /** List of all available theme names */
  themes?: TThemes | undefined;
  /** Forced theme name for the current page */
  forcedTheme?: ThemeName<TThemes> | undefined;
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: boolean | undefined;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean | undefined;
  /** Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons */
  enableColorScheme?: boolean | undefined;
  /** Cookie configuration used to store theme preference */
  cookie?: CookieConfig | undefined;
  /** Theme name to use for server rendering */
  initialTheme?: ThemeName<TThemes> | undefined;
  /** Default theme name (for v0.0.12 and lower the default was light). If `enableSystem` is false, the default theme is light */
  defaultTheme?: ThemeName<TThemes> | undefined;
  /** HTML attribute modified based on the active theme. Accepts `class`, `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.), or an array which could include both */
  attribute?: Attribute | Attribute[] | undefined;
  /** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
  value?: ValueObject | undefined;
  /** Nonce string to pass to the inline script and style elements for CSP headers */
  nonce?: string;
  /** Props to pass the inline script */
  scriptProps?: ScriptProps;
}
