import {parseThemeCookie as parseThemeCookieHeader} from './header';
import {registerTheme as applyRegisterTheme} from './register-theme';
import {
  listVariants as getThemeVariants,
  decodeVariant as parseVariant,
  encodeVariant as serializeVariant,
} from './theme-cookie';
import {
  getCookieName,
  resolveDefaultTheme,
} from './theme-runtime';
import {themeScript as renderThemeScript} from './theme-script';
import type {
  AnyThemeOptions,
  AttributeFromOptions,
  CreatedTheme,
  EnableSystemFromOptions,
  HumanReadable,
  RegisterThemeRuntimeOptions,
  ThemeHtmlAttributes,
  ThemeHtmlProps,
  ThemeNameFromOptions,
  ThemeOptions,
  ThemeScriptRuntimeOptions,
  ThemeState,
} from './types';

type BoundThemeState<
  TOptions extends AnyThemeOptions,
> = ThemeState<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
>;

type BoundRegisterThemeRuntime<
  TOptions extends AnyThemeOptions,
> = RegisterThemeRuntimeOptions<
  ThemeNameFromOptions<TOptions>
>;

type BoundThemeScriptRuntime<
  TOptions extends AnyThemeOptions,
> = ThemeScriptRuntimeOptions<
  ThemeNameFromOptions<TOptions>
>;

type ThemeCodecOptionsFromTheme<
  TOptions extends AnyThemeOptions,
> = Pick<TOptions, 'enableSystem' | 'themes'>;

const defaultThemeOptions: ThemeOptions = {};

const pickThemeCodecOptions = <
  TOptions extends AnyThemeOptions,
>(
  options: TOptions,
): ThemeCodecOptionsFromTheme<TOptions> =>
  ({
    enableSystem: options.enableSystem,
    themes: options.themes,
  }) as ThemeCodecOptionsFromTheme<TOptions>;

const createThemeWithOptions = <
  const TOptions extends AnyThemeOptions,
>(
  options: TOptions,
): CreatedTheme<TOptions> => {
  const codecOptions = pickThemeCodecOptions(options);
  const resolvedDefaultTheme = resolveDefaultTheme(
    options.defaultTheme,
    options.enableSystem,
  );
  const defaultVariant = serializeVariant(
    resolvedDefaultTheme === 'system'
      ? {
          selected: 'system',
          resolved: 'light',
          system: 'light',
        }
      : {
          selected: resolvedDefaultTheme,
          resolved: resolvedDefaultTheme,
          system:
            resolvedDefaultTheme === 'dark'
              ? 'dark'
              : 'light',
        },
  ) as CreatedTheme<TOptions>['defaultVariant'];

  function registerTheme(
    themeState?: BoundThemeState<TOptions>,
    runtime?: BoundRegisterThemeRuntime<TOptions> & {
      renderMode?: 'jsx' | undefined;
    },
  ): HumanReadable<
    ThemeHtmlProps<AttributeFromOptions<TOptions>>
  >;

  function registerTheme(
    themeState: BoundThemeState<TOptions> | undefined,
    runtime: BoundRegisterThemeRuntime<TOptions> & {
      renderMode: 'html-attrs';
    },
  ): HumanReadable<
    ThemeHtmlAttributes<AttributeFromOptions<TOptions>>
  >;

  function registerTheme(
    themeState: BoundThemeState<TOptions> | undefined,
    runtime: BoundRegisterThemeRuntime<TOptions> & {
      renderMode: 'html-string';
    },
  ): string;

  function registerTheme(
    themeState?: BoundThemeState<TOptions>,
    runtime?: BoundRegisterThemeRuntime<TOptions>,
  ):
    | string
    | HumanReadable<
        ThemeHtmlAttributes<
          AttributeFromOptions<TOptions>
        >
      >
    | HumanReadable<
        ThemeHtmlProps<AttributeFromOptions<TOptions>>
      > {
    const {forced, className, renderMode, style} =
      runtime ?? {};

    const isJsx =
      renderMode === undefined || renderMode === 'jsx';
    const resolvedTheme =
      forced ??
      themeState?.resolved ??
      (themeState?.selected === 'system'
        ? undefined
        : themeState?.selected);
    const shouldSuppressHydrationWarning =
      isJsx && resolvedTheme === undefined;

    const registeredTheme = applyRegisterTheme({
      ...options,
      ...(themeState ?? {}),
      ...(forced ? {resolved: forced} : {}),
      className,
      renderMode,
      style,
    });

    if (!shouldSuppressHydrationWarning) {
      return registeredTheme as unknown as ReturnType<
        CreatedTheme<TOptions>['registerTheme']
      >;
    }

    return {
      ...(registeredTheme as ThemeHtmlProps<
        AttributeFromOptions<TOptions>
      >),
      suppressHydrationWarning: true,
    } as unknown as ReturnType<
      CreatedTheme<TOptions>['registerTheme']
    >;
  }

  return {
    options,
    defaultVariant,
    encodeVariant: themeState =>
      serializeVariant(themeState),
    decodeVariant: value =>
      parseVariant(value, codecOptions) as ReturnType<
        CreatedTheme<TOptions>['decodeVariant']
      >,
    listVariants: () =>
      getThemeVariants(codecOptions) as ReturnType<
        CreatedTheme<TOptions>['listVariants']
      >,
    parseThemeCookie: cookieHeader =>
      parseThemeCookieHeader(cookieHeader, {
        cookieName: getCookieName(options.cookie),
        ...codecOptions,
      }) as ReturnType<
        CreatedTheme<TOptions>['parseThemeCookie']
      >,
    registerTheme,
    themeScript: (
      runtime?: BoundThemeScriptRuntime<TOptions>,
    ) =>
      renderThemeScript({
        ...options,
        forced: runtime?.forced,
      }),
  };
};

export function createTheme(): CreatedTheme<ThemeOptions>;

export function createTheme<
  const TOptions extends AnyThemeOptions,
>(options: TOptions): CreatedTheme<TOptions>;

export function createTheme(
  options: AnyThemeOptions | undefined,
): CreatedTheme<AnyThemeOptions>;

export function createTheme(
  options?: AnyThemeOptions,
) {
  return options
    ? createThemeWithOptions(options)
    : createThemeWithOptions(defaultThemeOptions);
}
