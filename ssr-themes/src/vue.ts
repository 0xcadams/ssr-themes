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
  disableThemeTransitions,
  updateThemeAttributes,
  updateThemeColorScheme,
} from './theme-dom';
import {
  createThemeBroadcastSubscription,
  defaultThemes,
  getCookieName,
  getSystemTheme,
  getTheme,
  postThemeBroadcast,
  resolveDefaultTheme,
  saveToCookie,
  subscribeToSystemTheme,
} from './theme-runtime';
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

const isServer = typeof window === 'undefined';
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

    const enableSystemValue = computed(
      () => props.enableSystem ?? true,
    );
    const themes = computed(
      () =>
        (props.themes ??
          (defaultThemes as readonly string[])) as readonly string[],
    );
    const resolvedDefaultTheme = computed(() =>
      resolveDefaultTheme(
        props.defaultTheme,
        enableSystemValue.value,
      ),
    );
    const cookieName = computed(() =>
      getCookieName(props.cookie),
    );
    const theme = ref<string | undefined>(
      getTheme(
        cookieName.value,
        resolvedDefaultTheme.value,
        props.selectedTheme,
      ),
    );
    const systemTheme = ref<string | undefined>(
      theme.value === 'system' && !isServer
        ? getSystemTheme()
        : theme.value,
    );
    const themeValues = computed(() =>
      !props.valueMap
        ? themes.value
        : Object.values(props.valueMap).filter(
            (value): value is string => Boolean(value),
          ),
    );
    const availableThemes = computed(
      () =>
        (enableSystemValue.value
          ? [...themes.value, 'system']
          : themes.value) as ReadonlyArray<string>,
    );
    const forcedTheme = computed(
      () => props.forcedTheme,
    );
    const resolvedTheme = computed(() => {
      const appliedTheme =
        forcedTheme.value ?? theme.value;
      return appliedTheme === 'system' &&
        enableSystemValue.value
        ? systemTheme.value
        : appliedTheme;
    });
    const colorScheme = computed(() =>
      enableSystemValue.value
        ? (systemTheme.value as
            | LightOrDark
            | undefined)
        : undefined,
    );
    let broadcastChannel: BroadcastChannel | null =
      null;
    let cleanupSystemTheme = () => {};
    let cleanupBroadcast = () => {};

    const applyTheme = (value: string | undefined) => {
      if (!value) {
        return undefined;
      }

      let resolved = value;
      if (
        resolved === 'system' &&
        enableSystemValue.value
      ) {
        resolved = getSystemTheme();
      }

      const nextName = props.valueMap
        ? props.valueMap[resolved]
        : resolved;
      const restoreTransitions =
        (props.disableTransitionOnChange ?? true)
          ? disableThemeTransitions(props.nonce)
          : null;
      const element = document.documentElement;
      const attributes = Array.isArray(props.attribute)
        ? props.attribute
        : [props.attribute ?? 'class'];

      updateThemeAttributes(
        element,
        attributes,
        themeValues.value,
        nextName,
      );
      updateThemeColorScheme(
        element,
        resolved,
        props.enableColorScheme ?? true,
      );

      restoreTransitions?.();
      return resolved;
    };

    const broadcastTheme = (value: string) => {
      postThemeBroadcast(
        broadcastChannel,
        cookieName.value,
        value,
      );
    };

    const setTheme: ThemeSetter<
      string,
      boolean
    > = value => {
      const nextTheme =
        typeof value === 'function'
          ? value(theme.value)
          : value;

      theme.value = nextTheme;
      saveToCookie(
        cookieName.value,
        nextTheme,
        props.cookie,
      );
      broadcastTheme(nextTheme);

      return nextTheme;
    };

    if (!isServer) {
      watchEffect(() => {
        applyTheme(forcedTheme.value ?? theme.value);
      });
    }

    onMounted(() => {
      cleanupSystemTheme = subscribeToSystemTheme(
        event => {
          const nextTheme = getSystemTheme(event);
          const isChangeEvent = 'type' in event;
          const hasSystemCookie =
            getTheme(
              cookieName.value,
              undefined,
              undefined,
            ) === 'system';
          systemTheme.value = nextTheme;

          if (
            (isChangeEvent || hasSystemCookie) &&
            theme.value === 'system' &&
            enableSystemValue.value &&
            !forcedTheme.value
          ) {
            saveToCookie(
              cookieName.value,
              'system',
              props.cookie,
            );
            applyTheme('system');
          }
        },
      );

      const {channel, cleanup} =
        createThemeBroadcastSubscription(
          cookieName.value,
          value => {
            theme.value =
              value ?? resolvedDefaultTheme.value;
          },
        );
      broadcastChannel = channel;
      cleanupBroadcast = () => {
        cleanup();
        if (broadcastChannel === channel) {
          broadcastChannel = null;
        }
      };
    });

    onUnmounted(() => {
      cleanupSystemTheme();
      cleanupBroadcast();
    });

    const providerValue: ThemeContextValue = {
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme,
      themes: availableThemes,
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
