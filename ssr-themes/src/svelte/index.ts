import type {Component, Snippet} from 'svelte';
import ThemeProviderInternal from './ThemeProvider.svelte';
import {useTheme as useThemeInternal} from './context.js';
import type {ThemeContext} from './types.js';
import type {
  AnyThemeOptions,
  BindThemeInput,
  CreatedTheme,
  EnableSystemFromOptions,
  HumanReadable,
  ThemeNameFromOptions,
  ThemeProviderRuntimeProps,
} from '../types';

export type {
  SetThemeValue,
  ThemeContext,
} from './types.js';

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
  children?: Snippet | undefined;
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
  ThemeProvider: Component<
    BoundThemeProviderProps<TOptions>
  >;

  /**
   * Returns theme state from the nearest
   * `ThemeProvider`.
   *
   * Must be used within `ThemeProvider`.
   */
  useTheme: () => HumanReadable<
    ThemeContext<
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
  const ThemeProvider = ((internals, props) =>
    ThemeProviderInternal(internals, {
      ...options,
      ...props,
    })) as Component<
    BoundThemeProviderProps<TOptions>
  >;

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
