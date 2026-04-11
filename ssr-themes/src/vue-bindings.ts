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
  ThemeProviderRuntimeProps,
  ThemeState,
  WithSystem,
} from './types';

export type ThemeSetter<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = (
  value:
    | WithSystem<TTheme, TEnableSystem>
    | ((
        prev: WithSystem<TTheme, TEnableSystem>,
      ) => WithSystem<TTheme, TEnableSystem>),
) => void;

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  themes: ComputedRef<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  forced: ComputedRef<TTheme | undefined>;
  setSelected: ThemeSetter<TTheme, TEnableSystem>;
  selected: Readonly<
    Ref<WithSystem<TTheme, TEnableSystem> | undefined>
  >;
  resolved: ComputedRef<
    Exclude<TTheme, 'system'> | undefined
  >;
  system: ComputedRef<LightOrDark | undefined>;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>
  extends
    ThemeOptions<TTheme, TEnableSystem>,
    ThemeProviderRuntimeProps<TTheme, TEnableSystem> {}

type ThemeContextValue = ThemeResult<string, boolean>;

const ThemeContext = Symbol(
  'ThemeContext',
) as InjectionKey<ThemeContextValue>;

const themeProviderProps = {
  themes: Array as PropType<readonly string[]>,
  forced: String as PropType<string | undefined>,
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
  disableTransition: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  initial: Object as PropType<
    ThemeState<string, boolean> | undefined
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

  return context as ThemeResult<TTheme, TEnableSystem>;
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
    const selected = computed(
      () => snapshot.value.selected,
    ) as Readonly<Ref<string | undefined>>;
    const forced = computed(
      () => snapshot.value.forced,
    );
    const resolved = computed(
      () => snapshot.value.resolved,
    );
    const system = computed(
      () => snapshot.value.system,
    ) as ComputedRef<LightOrDark | undefined>;
    const themes = computed(
      () => snapshot.value.themes,
    );

    const setSelected: ThemeSetter<
      string,
      boolean
    > = value =>
      controller.setSelected(
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
      selected,
      setSelected,
      forced,
      resolved,
      themes,
      system,
    };

    provide(ThemeContext, providerValue);

    return () => slots.default?.();
  },
});
