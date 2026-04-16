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

export interface BoundThemeProviderProps<
  TOptions extends AnyThemeOptions,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
> {
  children?: JSX.Element;
}

export interface ThemeBinding<
  TOptions extends AnyThemeOptions,
> {
  ThemeProvider: (
    props: BoundThemeProviderProps<TOptions>,
  ) => JSX.Element;
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
