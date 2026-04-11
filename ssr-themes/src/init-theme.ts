import {themeFromCookieHeader as parseThemeFromCookieHeader} from './header';
import {registerTheme as applyRegisterTheme} from './register-theme';
import {
  decodeTheme as parseTheme,
  encodeTheme as serializeTheme,
  themeVariants as listThemeVariants,
} from './theme-cookie';
import {getCookieName} from './theme-runtime';
import {themeScript as renderThemeScript} from './theme-script';
import type {
  AnyThemeOptions,
  AttributeFromOptions,
  EnableSystemFromOptions,
  InitializedTheme,
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

export const initTheme = <
  const TOptions extends AnyThemeOptions =
    ThemeOptions,
>(
  options = {} as TOptions,
): InitializedTheme<TOptions> => {
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
    const {forcedTheme, className, renderMode, style} =
      runtime ?? {};

    return applyRegisterTheme({
      ...options,
      ...(themeState ?? {}),
      ...(forcedTheme
        ? {appliedTheme: forcedTheme}
        : {}),
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
    themeOptions: options,
    encodeTheme: themeState =>
      serializeTheme<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(themeState),
    decodeTheme: value =>
      parseTheme<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(value, codecOptions),
    themeVariants: () =>
      listThemeVariants<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >(codecOptions) as ReadonlyArray<
        BoundThemeVariant<TOptions>
      >,
    themeFromCookieHeader: cookieHeader =>
      parseThemeFromCookieHeader<
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
        forcedTheme: runtime?.forcedTheme,
      }),
  };
};
