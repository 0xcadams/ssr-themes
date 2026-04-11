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
  ThemeNameFromOptions,
  ThemeProviderRuntimeProps,
} from './types';

export interface BoundThemeProviderProps<
  TOptions extends AnyThemeOptions,
> extends ThemeProviderRuntimeProps<
  ThemeNameFromOptions<TOptions>,
  EnableSystemFromOptions<TOptions>
> {}

export interface ThemeBinding<
  TOptions extends AnyThemeOptions,
> {
  ThemeProvider: ReturnType<typeof defineComponent>;
  useTheme: () => ThemeResult<
    ThemeNameFromOptions<TOptions>,
    EnableSystemFromOptions<TOptions>
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
