import {defineComponent, h} from 'vue';
import {
  ThemeProvider as ThemeProviderInternal,
  useTheme as useThemeInternal,
  type ThemeResult,
} from './vue-bindings';
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
> {}

export interface ThemeBinding<
  TInput extends BindThemeInput,
> {
  ThemeProvider: ReturnType<typeof defineComponent>;
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
  const ThemeProvider = defineComponent({
    name: 'BoundThemeProvider',
    props: {
      disableTransitionOnChange: {
        type: Boolean,
        default: undefined,
      },
      forcedTheme: String,
      initialColorScheme: String,
      nonce: String,
      selectedTheme: String,
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
