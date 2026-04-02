import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watchEffect,
} from 'vue';
import type {
  ComputedRef,
  InjectionKey,
  PropType,
  Ref,
} from 'vue';
import {
  createThemeController,
  pickThemeControllerOptions,
  type ThemeControllerSetValue,
} from './theme-controller';
import type {
  Attribute,
  CookieOptions,
  LightOrDark,
  ThemeOptions,
  WithSystem,
} from './types';

export type ThemeSetter<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = (
  value:
    | WithSystem<TTheme, TEnableSystem>
    | ((
        prev:
          | WithSystem<TTheme, TEnableSystem>
          | undefined,
      ) => WithSystem<TTheme, TEnableSystem>),
) => WithSystem<TTheme, TEnableSystem>;

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  themes: ComputedRef<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  forcedTheme: ComputedRef<TTheme | undefined>;
  setTheme: ThemeSetter<TTheme, TEnableSystem>;
  theme: Readonly<
    Ref<WithSystem<TTheme, TEnableSystem> | undefined>
  >;
  resolvedTheme: ComputedRef<
    Exclude<TTheme, 'system'> | undefined
  >;
  colorScheme: ComputedRef<
    TEnableSystem extends true
      ? LightOrDark
      : undefined
  >;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeOptions<TTheme, TEnableSystem> {
  disableTransitionOnChange?: boolean | undefined;
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string;
}

type ThemeContextValue = ThemeResult<string, boolean>;

const ThemeContext = Symbol(
  'ThemeContext',
) as InjectionKey<ThemeContextValue>;

const themeProviderProps = {
  themes: Array as PropType<readonly string[]>,
  forcedTheme: String as PropType<string | undefined>,
  enableSystem: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  enableColorScheme: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  cookie: Object as PropType<
    CookieOptions | undefined
  >,
  defaultTheme: String as PropType<string | undefined>,
  attribute: [String, Array] as PropType<
    Attribute | Attribute[] | undefined
  >,
  valueMap: Object as PropType<
    Partial<Record<string, string>> | undefined
  >,
  disableTransitionOnChange: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  selectedTheme: String as PropType<
    string | undefined
  >,
  nonce: String as PropType<string | undefined>,
} as const;

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() => {
  const context = inject(ThemeContext, undefined);
  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider.',
    );
  }

  return context as unknown as ThemeResult<
    TTheme,
    TEnableSystem
  >;
};

export const ThemeProvider = defineComponent({
  name: 'ThemeProvider',
  props: themeProviderProps,
  setup(props, {slots}) {
    const context = inject(ThemeContext, undefined);

    if (context) {
      return () => slots.default?.();
    }

    const controller = createThemeController(
      pickThemeControllerOptions(props),
    );
    const snapshot = ref(controller.getSnapshot());
    const syncSnapshot = () => {
      snapshot.value = controller.getSnapshot();
    };
    const theme = computed(
      () => snapshot.value.theme,
    ) as Readonly<Ref<string | undefined>>;
    const forcedTheme = computed(
      () => snapshot.value.forcedTheme,
    );
    const resolvedTheme = computed(
      () => snapshot.value.resolvedTheme,
    );
    const colorScheme = computed(
      () => snapshot.value.colorScheme,
    ) as ComputedRef<LightOrDark | undefined>;
    const themes = computed(
      () => snapshot.value.themes,
    );

    const setTheme: ThemeSetter<
      string,
      boolean
    > = value =>
      controller.setTheme(
        value as ThemeControllerSetValue<
          string,
          boolean
        >,
      );

    watchEffect(() => {
      controller.update(
        pickThemeControllerOptions(props),
      );
      syncSnapshot();
    });

    let unsubscribe = () => {};

    onMounted(() => {
      unsubscribe = controller.subscribe(syncSnapshot);
      controller.start();
      syncSnapshot();
    });

    onUnmounted(() => {
      unsubscribe();
      controller.stop();
    });

    const providerValue: ThemeContextValue = {
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme,
      themes,
      colorScheme,
    };

    provide(ThemeContext, providerValue);

    return () => slots.default?.();
  },
});

export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeOptions,
  WithSystem,
} from './types';
