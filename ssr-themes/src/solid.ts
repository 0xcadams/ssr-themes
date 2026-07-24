import {createComponent, type JSX} from 'solid-js';
import {
  ThemeProvider as ThemeProviderInternal,
  useTheme as useThemeInternal,
  type ThemeResult,
} from './solid-bindings';
import type {
  AnyThemeOptions,
  BindThemeInput,
  CreatedTheme,
  EnableSystemFromOptions,
  HumanReadable,
  ThemeNameFromOptions,
  ThemeProviderRuntimeProps,
} from './types';

export type {
  ThemeResult,
  ThemeSetter,
} from './solid-bindings';

/**
 * Runtime props for a bound `ThemeProvider`.
 *
 * Shared config comes from `bindTheme()`. These
 * props only control the current render.
 */
export interface BoundThemeProviderProps<
  TOptions extends AnyThemeOptions,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
> {
  children?: JSX.Element;
}

/**
 * Framework bindings returned by `bindTheme()`.
 *
 * These are the runtime entrypoints used by
 * the app.
 */
export interface ThemeBinding<
  TOptions extends AnyThemeOptions,
> {
  /**
   * Provides theme state to descendants and
   * keeps the document in sync after mount.
   *
   * Pass runtime values such as `initial`,
   * `forced`, `disableTransition`, or `nonce`
   * here.
   */
  ThemeProvider: (
    props: BoundThemeProviderProps<TOptions>,
  ) => JSX.Element;

  /**
   * Returns theme state from the nearest
   * `ThemeProvider`.
   *
   * Must be used within `ThemeProvider`.
   */
  useTheme: () => HumanReadable<
    ThemeResult<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >
  >;
}

const createThemeBinding = <
  const TOptions extends AnyThemeOptions,
>(
  options: TOptions,
): ThemeBinding<TOptions> => {
  const ThemeProvider = (
    props: BoundThemeProviderProps<TOptions>,
  ) =>
    createComponent(ThemeProviderInternal, {
      ...options,
      get disableTransition() {
        return props.disableTransition;
      },
      get forced() {
        return props.forced;
      },
      get initial() {
        return props.initial;
      },
      get nonce() {
        return props.nonce;
      },
      get children() {
        return props.children;
      },
    });

  const useTheme = () =>
    useThemeInternal<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >();

  return {
    ThemeProvider,
    useTheme,
  };
};

/**
 * Returns framework bindings for a shared
 * theme config.
 *
 * Accepts either a `createTheme()` result or
 * the underlying options object, then returns
 * a bound `ThemeProvider` and `useTheme()` pair
 * for that config.
 *
 * @param input Theme config to bind.
 */
export function bindTheme<
  const TOptions extends AnyThemeOptions,
>(input: TOptions): ThemeBinding<TOptions>;

export function bindTheme<
  const TOptions extends AnyThemeOptions,
>(
  input: CreatedTheme<TOptions>,
): ThemeBinding<TOptions>;

export function bindTheme(input: BindThemeInput) {
  return 'options' in input
    ? createThemeBinding(input.options)
    : createThemeBinding(input);
}
