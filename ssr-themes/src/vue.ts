import {defineComponent, h} from 'vue';
import {
  ThemeProvider as ThemeProviderInternal,
  useTheme as useThemeInternal,
  type ThemeResult,
} from './vue-bindings';
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
} from './vue-bindings';

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
> {}

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
  ThemeProvider: ReturnType<typeof defineComponent>;

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
  const ThemeProvider = defineComponent({
    name: 'BoundThemeProvider',
    props: {
      disableTransition: {
        type: Boolean,
        default: undefined,
      },
      forced: String,
      initial: Object,
      nonce: String,
    },
    setup(props, {slots}) {
      return () =>
        h(
          ThemeProviderInternal,
          {
            ...options,
            ...props,
          } as never,
          {
            default: () => slots.default?.(),
          },
        );
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
