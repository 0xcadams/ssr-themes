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

type RegisterThemeAttribute =
  | Attribute
  | readonly Attribute[];

type ThemeAttributeUnion<
  TAttribute extends
    | RegisterThemeAttribute
    | undefined,
> = TAttribute extends readonly (infer TMember)[]
  ? Extract<TMember, Attribute>
  : TAttribute extends Attribute
    ? TAttribute
    : never;

type ThemeValueMap<TTheme extends string> = Partial<
  Record<TTheme, string>
>;

export type WithSystem<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = TEnableSystem extends false
  ? TTheme
  : TTheme | 'system';

export interface ThemeState<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** Selected theme name stored by the app */
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Literal theme name that should be applied to html */
  appliedTheme?: TTheme | undefined;
  /** Last known browser color-scheme hint */
  colorScheme?: LightOrDark | undefined;
}

export interface ThemeCookieState<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeState<TTheme, TEnableSystem> {
  /** Selected theme name stored by the app */
  selectedTheme: WithSystem<TTheme, TEnableSystem>;
  /** Literal theme name that should be applied to html */
  appliedTheme: TTheme;
  /** Last known browser color-scheme hint */
  colorScheme?: LightOrDark | undefined;
}

export interface ThemeVariant<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeCookieState<TTheme, TEnableSystem> {
  /** Stable serialized value for routing or caching */
  value: string;
}

export interface ThemeOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** List of all available theme names */
  themes?: readonly TTheme[] | undefined;
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

export interface ThemeScriptRuntimeOptions<
  TTheme extends string = LightOrDark,
> {
  /** Forced theme name for the current page */
  forcedTheme?: TTheme | undefined;
}

export interface ThemeProviderRuntimeProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeScriptRuntimeOptions<TTheme> {
  /** Selected theme name to use for server rendering */
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Initial browser color-scheme hint to reuse during hydration */
  initialColorScheme?: LightOrDark | undefined;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean | undefined;
  /** Nonce string to pass to the inline style elements for CSP headers */
  nonce?: string | undefined;
}

type ThemeStyle = Record<
  string,
  string | number | undefined
>;

export type {ThemeStyle};

export type ThemeHtmlProps<
  TAttribute extends
    | RegisterThemeAttribute
    | undefined = 'class',
> = {
  className?: string;
  style?: ThemeStyle;
} & Partial<
  Record<
    Extract<
      ThemeAttributeUnion<TAttribute>,
      DataAttribute
    >,
    string
  >
>;

export type ThemeHtmlAttributes<
  TAttribute extends
    | RegisterThemeAttribute
    | undefined = 'class',
> = {
  class?: string;
  style?: string;
} & Partial<
  Record<
    Extract<
      ThemeAttributeUnion<TAttribute>,
      DataAttribute
    >,
    string
  >
>;

export interface RegisterThemeOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
  TAttribute extends
    | RegisterThemeAttribute
    | undefined = 'class',
> extends Pick<
  ThemeOptions<TTheme, TEnableSystem>,
  'valueMap' | 'enableColorScheme'
> {
  /** Selected theme name for SSR and hydration state */
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Literal theme name to apply to the html element */
  appliedTheme?: TTheme | undefined;
  /** Render output as JSX props, an HTML attrs object, or an HTML attribute string */
  renderMode?:
    | 'jsx'
    | 'html-attrs'
    | 'html-string'
    | undefined;
  /** Same attribute config used by ThemeProvider and themeScript() */
  attribute?: TAttribute | undefined;
  /** Optional class name to merge with the theme class */
  className?: string | undefined;
  /** Optional style object to merge with color-scheme */
  style?: ThemeStyle | undefined;
}

export interface RegisterThemeRuntimeOptions<
  TTheme extends string = LightOrDark,
>
  extends
    Pick<
      RegisterThemeOptions<TTheme>,
      'className' | 'renderMode' | 'style'
    >,
    ThemeScriptRuntimeOptions<TTheme> {}

export type AnyThemeOptions = ThemeOptions<
  string,
  boolean
>;

export type ThemeNameFromOptions<
  TOptions extends AnyThemeOptions,
> = TOptions extends {
  themes: readonly (infer TTheme extends string)[];
}
  ? TTheme
  : LightOrDark;

export type EnableSystemFromOptions<
  TOptions extends AnyThemeOptions,
> = TOptions extends {
  enableSystem: infer TEnableSystem extends boolean;
}
  ? TEnableSystem
  : true;

export type AttributeFromOptions<
  TOptions extends AnyThemeOptions,
> = TOptions extends {
  attribute: infer TAttribute extends
    RegisterThemeAttribute;
}
  ? TAttribute
  : 'class';

export interface InitializedTheme<
  TOptions extends AnyThemeOptions = AnyThemeOptions,
> {
  themeOptions: TOptions;
  encodeTheme: (
    themeState?: ThemeState<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >,
  ) => string | undefined;
  decodeTheme: (
    value: string | undefined,
  ) =>
    | ThemeCookieState<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >
    | undefined;
  themeVariants: () => ReadonlyArray<
    ThemeVariant<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >
  >;
  themeFromCookieHeader: (
    cookieHeader: string | null | undefined,
  ) =>
    | ThemeCookieState<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >
    | undefined;
  registerTheme(
    themeState?: ThemeState<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >,
    runtime?: RegisterThemeRuntimeOptions<
      ThemeNameFromOptions<TOptions>
    > & {
      renderMode?: 'jsx' | undefined;
    },
  ): ThemeHtmlProps<AttributeFromOptions<TOptions>>;
  registerTheme(
    themeState:
      | ThemeState<
          ThemeNameFromOptions<TOptions>,
          EnableSystemFromOptions<TOptions>
        >
      | undefined,
    runtime: RegisterThemeRuntimeOptions<
      ThemeNameFromOptions<TOptions>
    > & {
      renderMode: 'html-attrs';
    },
  ): ThemeHtmlAttributes<
    AttributeFromOptions<TOptions>
  >;
  registerTheme(
    themeState:
      | ThemeState<
          ThemeNameFromOptions<TOptions>,
          EnableSystemFromOptions<TOptions>
        >
      | undefined,
    runtime: RegisterThemeRuntimeOptions<
      ThemeNameFromOptions<TOptions>
    > & {
      renderMode: 'html-string';
    },
  ): string;
  themeScript: (
    runtime?: ThemeScriptRuntimeOptions<
      ThemeNameFromOptions<TOptions>
    >,
  ) => string;
}

export type BindThemeInput<
  TOptions extends AnyThemeOptions = AnyThemeOptions,
> = TOptions | InitializedTheme<TOptions>;

export type ThemeOptionsFromBindInput<
  TInput extends BindThemeInput,
> =
  TInput extends InitializedTheme<infer TOptions>
    ? TOptions
    : TInput;
