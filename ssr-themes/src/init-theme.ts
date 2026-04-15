import {parseThemeCookie as parseThemeCookieHeader} from './header';
import {registerTheme as applyRegisterTheme} from './register-theme';
import {
  decodeVariant as parseVariant,
  encodeVariant as serializeVariant,
  listVariants as getThemeVariants,
} from './theme-cookie';
import {resolveDefaultTheme} from './theme-runtime';
import {getCookieName} from './theme-runtime';
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
  ThemeState,
  ThemeScriptRuntimeOptions,
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

    return applyRegisterTheme({
      ...options,
      ...(themeState ?? {}),
      ...(forced ? {resolved: forced} : {}),
      className,
      renderMode,
      style,
    }) as unknown as ReturnType<typeof registerTheme>;
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
