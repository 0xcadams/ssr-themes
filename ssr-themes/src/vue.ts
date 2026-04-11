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
  ('options' in input
    ? input.options
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
