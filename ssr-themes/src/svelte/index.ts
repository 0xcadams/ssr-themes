import type {Component, Snippet} from 'svelte';
import ThemeProviderInternal from './ThemeProvider.svelte';
import {useTheme as useThemeInternal} from './context.js';
import type {ThemeContext} from './types.js';
import type {
  BindThemeInput,
  EnableSystemFromOptions,
  ThemeNameFromOptions,
  ThemeOptionsFromBindInput,
  ThemeProviderRuntimeProps,
} from '../types';

type BoundThemeOptions<TInput extends BindThemeInput> =
  ThemeOptionsFromBindInput<TInput>;

export interface BoundThemeProviderProps<
  TInput extends BindThemeInput,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<BoundThemeOptions<TInput>>,
  EnableSystemFromOptions<BoundThemeOptions<TInput>>
> {
  children?: Snippet | undefined;
}

export interface ThemeBinding<
  TInput extends BindThemeInput,
> {
  ThemeProvider: Component<
    BoundThemeProviderProps<TInput>
  >;
  useTheme: () => ThemeContext<
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
  const ThemeProvider = ((internals, props) =>
    ThemeProviderInternal(internals, {
      ...options,
      ...props,
    })) as Component<BoundThemeProviderProps<TInput>>;

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
