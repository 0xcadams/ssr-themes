/**
 * Cookie settings used to persist the selected
 * theme.
 *
 * These map directly to standard cookie
 * attributes.
 */
export interface CookieOptions {
  /** Cookie name used to store the selected theme */
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
  /** Cookie Secure attribute */
  secure?: boolean;
}

export type LightOrDarkTuple = readonly [
  'dark',
  'light',
];

/** Built-in light and dark theme names. */
export type LightOrDark = LightOrDarkTuple[number];

type DataAttribute = `data-${string}`;

/** HTML attribute target used to apply the active theme. */
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

/**
 * Adds `'system'` to a theme union when system
 * mode is enabled.
 *
 * This is used throughout the public API for
 * selected theme values.
 */
export type WithSystem<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = TEnableSystem extends false
  ? TTheme
  : TTheme | 'system';

export type HumanReadable<T> = T extends unknown
  ? {[TKey in keyof T]: T[TKey]}
  : never;

/**
 * Theme state used across SSR and hydration.
 *
 * `selected` is the stored preference.
 * `resolved` is the concrete theme applied to
 * the document.
 */
export interface ThemeState<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** Selected theme preference */
  selected?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Concrete theme applied to the document */
  resolved?: TTheme | undefined;
  /** Current browser system theme */
  system?: LightOrDark | undefined;
}

/**
 * Theme state with a concrete resolved theme.
 *
 * This is the shape returned once a theme has
 * been fully decoded or resolved.
 */
export interface ResolvedThemeState<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeState<TTheme, TEnableSystem> {
  /** Selected theme preference */
  selected: WithSystem<TTheme, TEnableSystem>;
  /** Concrete theme applied to the document */
  resolved: TTheme;
  /** Current browser system theme */
  system?: LightOrDark | undefined;
}

/**
 * Resolved theme state with a stable serialized
 * `value`.
 *
 * Each entry represents one pre-renderable
 * theme variant.
 */
export interface ThemeVariant<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ResolvedThemeState<TTheme, TEnableSystem> {
  /** Stable serialized value for routing or caching */
  value: string;
}

/**
 * Stable serialized theme variant string.
 *
 * Used by `encodeVariant()`, `decodeVariant()`,
 * and `listVariants()`.
 */
export type EncodedThemeVariant<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> =
  | `${TTheme}~l`
  | `${TTheme}~d`
  | (TEnableSystem extends true ? '~l' | '~d' : never);

/**
 * Shared theme configuration used by server
 * helpers and framework bindings.
 *
 * Define the available themes, how the active
 * theme is written to `<html>`, and how the
 * selected value is persisted.
 */
export interface ThemeOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** Available theme names. Defaults to light and dark */
  themes?: readonly TTheme[] | undefined;
  /** Enables `'system'` as a selectable theme */
  enableSystem?: TEnableSystem | undefined;
  /** Adds color-scheme for resolved light and dark themes */
  enableColorScheme?: boolean | undefined;
  /** Cookie settings used to persist the selected theme */
  cookie?: CookieOptions | undefined;
  /** Selected theme used when no stored preference is available */
  defaultTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** HTML attribute target used to apply the active theme */
  attribute?:
    | Attribute
    | readonly Attribute[]
    | undefined;
  /** Maps theme names to the values written to HTML attributes */
  valueMap?: ThemeValueMap<TTheme> | undefined;
}

/**
 * Runtime overrides for `themeScript()`.
 *
 * These affect the current render only and do
 * not change the shared theme config.
 */
export interface ThemeScriptRuntimeOptions<
  TTheme extends string = LightOrDark,
> {
  /** Theme forced for the current page */
  forced?: TTheme | undefined;
}

/**
 * Runtime props accepted by framework
 * `ThemeProvider` components.
 *
 * These are the per-render values layered on
 * top of the shared config passed to
 * `bindTheme()`.
 */
export interface ThemeProviderRuntimeProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeScriptRuntimeOptions<TTheme> {
  /** SSR theme state to reuse during hydration */
  initial?:
    | HumanReadable<ThemeState<TTheme, TEnableSystem>>
    | undefined;
  /** Disables CSS transitions while the theme changes */
  disableTransition?: boolean | undefined;
  /** Nonce passed to inline style elements for CSP */
  nonce?: string | undefined;
}

type ThemeStyle = Record<
  string,
  string | number | undefined
>;

export type {ThemeStyle};

/**
 * JSX `<html>` props returned by
 * `registerTheme()` in `'jsx'` mode.
 *
 * Includes `className`, `style`, and any
 * configured `data-*` attributes.
 */
export type ThemeHtmlProps<
  TAttribute extends
    | RegisterThemeAttribute
    | undefined = 'class',
> = {
  className?: string;
  suppressHydrationWarning?: true;
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

/**
 * HTML attributes returned by `registerTheme()`
 * in `'html-attrs'` mode.
 *
 * Uses HTML attribute names such as `class`
 * instead of JSX prop names.
 */
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
  selected?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Literal theme name to apply to the html element */
  resolved?: TTheme | undefined;
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

/**
 * Runtime overrides for `registerTheme()`.
 *
 * Use these to force a theme for one render or
 * to merge additional class, style, or
 * output-mode settings.
 */
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

/**
 * Typed theme API returned by `createTheme()`.
 *
 * This groups the server-side helpers that
 * read, serialize, and pre-render theme state
 * from one shared config.
 */
export interface CreatedTheme<
  TOptions extends AnyThemeOptions = AnyThemeOptions,
> {
  /** Exact config object passed to `createTheme()` */
  options: TOptions;

  /**
   * Returns the default serialized theme
   * variant for this config.
   *
   * This is the fallback variant when no
   * request-specific theme state is available.
   */
  defaultVariant: EncodedThemeVariant<
    ThemeNameFromOptions<TOptions>,
    EnableSystemFromOptions<TOptions>
  > & {};

  /**
   * Serializes theme state into a stable
   * variant string.
   *
   * Use this for route params, cache keys, or
   * other pre-rendered theme variants. Returns
   * `undefined` when there is not enough state
   * to produce a stable value.
   *
   * @param themeState Theme state to serialize.
   */
  encodeVariant: (
    themeState?: ThemeState<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >,
  ) => string | undefined;

  /**
   * Decodes a serialized theme variant into
   * resolved theme state.
   *
   * Returns `undefined` for invalid or
   * unsupported values.
   *
   * @param value Serialized variant value.
   */
  decodeVariant: (
    value: string | undefined,
  ) =>
    | HumanReadable<
        ResolvedThemeState<
          ThemeNameFromOptions<TOptions>,
          EnableSystemFromOptions<TOptions>
        >
      >
    | undefined;

  /**
   * Returns all valid theme variants for the
   * current config.
   *
   * Use this to enumerate the finite set of SSR
   * or cacheable theme states.
   */
  listVariants: () => ReadonlyArray<
    HumanReadable<
      ThemeVariant<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >
    >
  >;

  /**
   * Returns theme state from a raw `Cookie`
   * header.
   *
   * Reads this theme's configured cookie and
   * decodes the stored variant. Returns
   * `undefined` when the cookie is missing or
   * invalid.
   *
   * @param cookieHeader Raw `Cookie` header
   * value for the current request.
   */
  parseThemeCookie: (
    cookieHeader: string | null | undefined,
  ) =>
    | HumanReadable<
        ResolvedThemeState<
          ThemeNameFromOptions<TOptions>,
          EnableSystemFromOptions<TOptions>
        >
      >
    | undefined;

  /**
   * Returns SSR attributes for `<html>` from
   * theme state.
   *
   * Pass server theme state, usually from
   * `parseThemeCookie()`, and spread the result
   * onto `<html>`.
   *
   * `renderMode` controls the return value:
   * - `'jsx'` (default) returns
   *   `{className, style, ...dataAttrs}`
   * - `'html-attrs'` returns
   *   `{class, style, ...dataAttrs}`
   * - `'html-string'` returns a serialized
   *   attribute string
   *
   * Adds `color-scheme` when the resolved theme
   * is `'light'` or `'dark'`, unless disabled.
   *
   * @param themeState Theme state for the
   * current request.
   * @param runtime Render-time overrides such
   * as `forced`, `className`, `style`, and
   * `renderMode`.
   */
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
  ): HumanReadable<
    ThemeHtmlProps<AttributeFromOptions<TOptions>>
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
      renderMode: 'html-attrs';
    },
  ): HumanReadable<
    ThemeHtmlAttributes<AttributeFromOptions<TOptions>>
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

  /**
   * Returns the inline bootstrap script that
   * applies the theme before hydration.
   *
   * Render this in a `<script>` tag near the
   * top of the document so the correct theme is
   * applied before the app hydrates.
   *
   * @param runtime Runtime overrides such as
   * `forced`.
   */
  themeScript: (
    runtime?: ThemeScriptRuntimeOptions<
      ThemeNameFromOptions<TOptions>
    >,
  ) => string;
}

export type BindThemeInput<
  TOptions extends AnyThemeOptions = AnyThemeOptions,
> = TOptions | CreatedTheme<TOptions>;

export type ThemeOptionsFromBindInput<
  TInput extends BindThemeInput,
> =
  TInput extends CreatedTheme<infer TOptions>
    ? TOptions
    : TInput;
