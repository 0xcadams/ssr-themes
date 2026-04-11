import type {Component, Snippet} from 'svelte';
import ThemeProviderInternal from './ThemeProvider.svelte';
import {useTheme as useThemeInternal} from './context.js';
import type {ThemeContext} from './types.js';
import type {
  AnyThemeOptions,
  BindThemeInput,
  CreatedTheme,
  EnableSystemFromOptions,
  ThemeNameFromOptions,
  ThemeProviderRuntimeProps,
} from '../types';

export interface BoundThemeProviderProps<
  TOptions extends AnyThemeOptions,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
> {
  children?: Snippet | undefined;
}

export interface ThemeBinding<
  TOptions extends AnyThemeOptions,
> {
  ThemeProvider: Component<
    BoundThemeProviderProps<TOptions>
  >;
  useTheme: () => ThemeContext<
    ThemeNameFromOptions<TOptions>,
    EnableSystemFromOptions<TOptions>
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
