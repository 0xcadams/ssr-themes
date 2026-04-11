import * as React from 'react';
import {
  ThemeProvider as ThemeProviderInternal,
  useTheme as useThemeInternal,
  type ThemeResult,
} from './react-bindings';
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
  children?: React.ReactNode | undefined;
}

export interface ThemeBinding<
  TInput extends BindThemeInput,
> {
  ThemeProvider: (
    props: BoundThemeProviderProps<TInput>,
  ) => React.JSX.Element;
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
  ('options' in input
    ? input.options
    : input) as BoundThemeOptions<TInput>;

export const bindTheme = <
  TInput extends BindThemeInput,
>(
  input: TInput,
): ThemeBinding<TInput> => {
  const options = resolveThemeOptions(input);

  const ThemeProvider = (
    props: BoundThemeProviderProps<TInput>,
  ) => (
    <ThemeProviderInternal {...options} {...props} />
  );

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
