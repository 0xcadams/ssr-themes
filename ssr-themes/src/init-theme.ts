import {parseThemeCookie as parseThemeCookieHeader} from './header';
import {registerTheme as applyRegisterTheme} from './register-theme';
import {
  decodeVariant as parseVariant,
  encodeVariant as serializeVariant,
  listVariants as getThemeVariants,
} from './theme-cookie';
import {getCookieName} from './theme-runtime';
import {themeScript as renderThemeScript} from './theme-script';
import type {
  AnyThemeOptions,
  AttributeFromOptions,
  CreatedTheme,
  EnableSystemFromOptions,
  RegisterThemeRuntimeOptions,
  ThemeHtmlAttributes,
  ThemeHtmlProps,
  ThemeNameFromOptions,
  ThemeOptions,
  ThemeState,
  ThemeVariant,
  ThemeScriptRuntimeOptions,
} from './types';

type BoundThemeState<
  TOptions extends AnyThemeOptions,
> = ThemeState<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
>;

type BoundThemeVariant<
  TOptions extends AnyThemeOptions,
> = ThemeVariant<
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

export const createTheme = <
  const TOptions extends AnyThemeOptions =
    ThemeOptions,
>(
  options = {} as TOptions,
): CreatedTheme<TOptions> => {
  const codecOptions = {
    enableSystem:
      options.enableSystem as EnableSystemFromOptions<TOptions>,
    themes: options.themes as ThemeOptions<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >['themes'],
  };

  function registerTheme(
    themeState?: BoundThemeState<TOptions>,
    runtime?: BoundRegisterThemeRuntime<TOptions> & {
      renderMode?: 'jsx' | undefined;
    },
  ): ThemeHtmlProps<AttributeFromOptions<TOptions>>;

  function registerTheme(
    themeState: BoundThemeState<TOptions> | undefined,
    runtime: BoundRegisterThemeRuntime<TOptions> & {
      renderMode: 'html-attrs';
    },
  ): ThemeHtmlAttributes<
    AttributeFromOptions<TOptions>
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
    | ThemeHtmlAttributes<
        AttributeFromOptions<TOptions>
      >
    | ThemeHtmlProps<AttributeFromOptions<TOptions>> {
    const {forced, className, renderMode, style} =
      runtime ?? {};

    return applyRegisterTheme({
      ...options,
      ...(themeState ?? {}),
      ...(forced ? {resolved: forced} : {}),
      className,
      renderMode,
      style,
    }) as
      | string
      | ThemeHtmlAttributes<
          AttributeFromOptions<TOptions>
        >
      | ThemeHtmlProps<AttributeFromOptions<TOptions>>;
  }

  return {
    options,
    encodeVariant: themeState =>
      serializeVariant<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(themeState),
    decodeVariant: value =>
      parseVariant<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(value, codecOptions),
    listVariants: () =>
      getThemeVariants(codecOptions) as ReadonlyArray<
        BoundThemeVariant<TOptions>
      >,
    parseThemeCookie: cookieHeader =>
      parseThemeCookieHeader<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(cookieHeader, {
        cookieName: getCookieName(options.cookie),
        ...codecOptions,
      }),
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
