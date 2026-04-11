import {createComponent, type JSX} from 'solid-js';
import {
  ThemeProvider as ThemeProviderInternal,
  useTheme as useThemeInternal,
  type ThemeResult,
} from './solid-bindings';
import type {
  BindThemeInput,
  EnableSystemFromOptions,
  ThemeNameFromOptions,
  ThemeOptionsFromBindInput,
  ThemeProviderRuntimeProps,
} from './types';

type BoundThemeOptions<TInput extends BindThemeInput> =
  ThemeOptionsFromBindInput<TInput>;

export interface BoundThemeProviderProps<
  TInput extends BindThemeInput,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<BoundThemeOptions<TInput>>,
  EnableSystemFromOptions<BoundThemeOptions<TInput>>
> {
  children?: JSX.Element;
}

export interface ThemeBinding<
  TInput extends BindThemeInput,
> {
  ThemeProvider: (
    props: BoundThemeProviderProps<TInput>,
  ) => JSX.Element;
  useTheme: () => ThemeResult<
    ThemeNameFromOptions<BoundThemeOptions<TInput>>,
    EnableSystemFromOptions<BoundThemeOptions<TInput>>
  >;
}

const resolveThemeOptions = <
  TInput extends BindThemeInput,
>(
  input: TInput,
): BoundThemeOptions<TInput> =>
  ('themeOptions' in input
    ? input.themeOptions
    : input) as BoundThemeOptions<TInput>;

export const bindTheme = <
  TInput extends BindThemeInput,
>(
  input: TInput,
): ThemeBinding<TInput> => {
  const options = resolveThemeOptions(input);

  const ThemeProvider = (
    props: BoundThemeProviderProps<TInput>,
  ) =>
    createComponent(ThemeProviderInternal, {
      ...options,
      get disableTransitionOnChange() {
        return props.disableTransitionOnChange;
      },
      get forcedTheme() {
        return props.forcedTheme;
      },
      get appliedTheme() {
        return props.appliedTheme;
      },
      get colorScheme() {
        return props.colorScheme;
      },
      get nonce() {
        return props.nonce;
      },
      get selectedTheme() {
        return props.selectedTheme;
      },
      get children() {
        return props.children;
      },
    });

  const useTheme = () =>
    useThemeInternal<
      ThemeNameFromOptions<BoundThemeOptions<TInput>>,
      EnableSystemFromOptions<
        BoundThemeOptions<TInput>
      >
    >();

  return {
    ThemeProvider,
    useTheme,
  };
};
