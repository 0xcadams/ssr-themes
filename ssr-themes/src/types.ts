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

export type LightOrDarkTuple = readonly [
  'dark',
  'light',
];
export type LightOrDark = LightOrDarkTuple[number];

type DataAttribute = `data-${string}`;

export type Attribute = DataAttribute | 'class';

type ThemeValueMap<TTheme extends string> = Partial<
  Record<TTheme, string>
>;

export type WithSystem<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = TEnableSystem extends true
  ? TTheme | 'system'
  : TTheme;

export interface ThemeOptions<
  TTheme extends string = LightOrDark,
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
  defaultTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** HTML attribute modified based on the active theme. Accepts `class`, `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.), or an array which could include both */
  attribute?: Attribute | Attribute[] | undefined;
  /** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
  valueMap?: ThemeValueMap<TTheme> | undefined;
}

type ThemeStyle = Record<
  string,
  string | number | undefined
>;

export type ThemeHtmlProps = {
  className?: string;
  style?: ThemeStyle;
} & Partial<Record<DataAttribute, string>>;

export interface RegisterThemeOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends Pick<
  ThemeOptions<TTheme, TEnableSystem>,
  'attribute' | 'valueMap' | 'enableColorScheme'
> {
  /** Resolved initial theme name to apply to the html element */
  initialTheme?: TTheme | undefined;
  /** Optional class name to merge with the theme class */
  className?: string | undefined;
  /** Optional style object to merge with color-scheme */
  style?: ThemeStyle | undefined;
}
