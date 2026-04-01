import type {Accessor, JSX} from 'solid-js';
import {
  createComponent,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  untrack,
  useContext,
} from 'solid-js';
import {isServer} from 'solid-js/web';
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
  themes: Accessor<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  forcedTheme: Accessor<TTheme | undefined>;
  setTheme: ThemeSetter<TTheme, TEnableSystem>;
  theme: Accessor<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;
  resolvedTheme: Accessor<
    Exclude<TTheme, 'system'> | undefined
  >;
  colorScheme: Accessor<
    TEnableSystem extends true
      ? LightOrDark
      : undefined
  >;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeOptions<TTheme, TEnableSystem> {
  children?: JSX.Element;
  disableTransitionOnChange?: boolean | undefined;
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string;
}

export type ThemeContextValue = ThemeResult<
  string,
  boolean
>;

export const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() => {
  const context = useContext(ThemeContext);
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

export const ThemeProvider = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const context = useContext(ThemeContext);

  if (context) {
    return props.children;
  }

  const enableSystemValue = createMemo(
    () =>
      (props.enableSystem ?? true) as TEnableSystem,
  );
  const themes = createMemo(
    () =>
      (props.themes ??
        (defaultThemes as unknown as readonly TTheme[])) as readonly TTheme[],
  );
  const resolvedDefaultTheme = createMemo(() =>
    resolveDefaultTheme<TTheme, TEnableSystem>(
      props.defaultTheme,
      enableSystemValue(),
    ),
  );
  const cookieName = getCookieName(props.cookie);
  const [theme, setThemeState] = createSignal<
    WithSystem<TTheme, TEnableSystem> | undefined
  >(
    getTheme(
      cookieName,
      resolvedDefaultTheme(),
      props.selectedTheme,
      themes(),
      enableSystemValue(),
    ),
  );
  const [systemTheme, setSystemTheme] = createSignal<
    Exclude<TTheme, 'system'> | undefined
  >(
    theme() === 'system' && !isServer
      ? (getSystemTheme() as Exclude<TTheme, 'system'>)
      : (theme() as
          | Exclude<TTheme, 'system'>
          | undefined),
  );
  const themeValues = createMemo(
    () =>
      (!props.valueMap
        ? themes()
        : Object.values(props.valueMap).filter(
            (value): value is string => Boolean(value),
          )) as readonly string[],
  );
  const availableThemes = createMemo(
    () =>
      (enableSystemValue()
        ? [...themes(), 'system']
        : themes()) as ReadonlyArray<
        WithSystem<TTheme, TEnableSystem>
      >,
  );
  const resolvedTheme = createMemo(() => {
    const appliedTheme = props.forcedTheme ?? theme();
    return appliedTheme === 'system' &&
      enableSystemValue()
      ? systemTheme()
      : (appliedTheme as
          | Exclude<TTheme, 'system'>
          | undefined);
  });
  const colorScheme = createMemo(
    () =>
      (enableSystemValue()
        ? (systemTheme() as unknown as LightOrDark)
        : undefined) as TEnableSystem extends true
        ? LightOrDark
        : undefined,
  );
  let broadcastChannel: BroadcastChannel | null = null;

  const applyTheme = (
    value:
      | WithSystem<TTheme, TEnableSystem>
      | undefined,
  ) => {
    if (!value) return undefined;

    let resolved = value;
    if (resolved === 'system' && enableSystemValue()) {
      resolved = getSystemTheme() as TTheme;
    }

    const nextTheme = resolved as TTheme;
    const nextName = props.valueMap
      ? props.valueMap[nextTheme]
      : nextTheme;
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
      themeValues(),
      nextName,
    );
    updateThemeColorScheme(
      element,
      nextTheme,
      props.enableColorScheme ?? true,
    );

    restoreTransitions?.();
    return resolved;
  };

  const broadcastTheme = (value: string) => {
    postThemeBroadcast(
      broadcastChannel,
      cookieName,
      value,
    );
  };

  const setTheme: ThemeSetter<
    TTheme,
    TEnableSystem
  > = value => {
    const nextTheme =
      typeof value === 'function'
        ? value(untrack(theme))
        : value;

    setThemeState(() => nextTheme);
    saveToCookie(cookieName, nextTheme, props.cookie);
    broadcastTheme(nextTheme);

    return nextTheme;
  };

  onMount(() => {
    const handleMediaQuery = (
      event: MediaQueryList | MediaQueryListEvent,
    ) => {
      const nextTheme = getSystemTheme(
        event,
      ) as Exclude<TTheme, 'system'>;
      const isChangeEvent = 'type' in event;
      const hasSystemCookie =
        getTheme<TTheme, TEnableSystem>(
          cookieName,
          undefined,
          undefined,
          themes(),
          enableSystemValue(),
        ) === 'system';
      setSystemTheme(() => nextTheme);

      if (
        (isChangeEvent || hasSystemCookie) &&
        theme() === 'system' &&
        enableSystemValue() &&
        !props.forcedTheme
      ) {
        saveToCookie(
          cookieName,
          'system',
          props.cookie,
        );
        applyTheme(
          'system' as WithSystem<
            TTheme,
            TEnableSystem
          >,
        );
      }
    };

    onCleanup(
      subscribeToSystemTheme(handleMediaQuery),
    );
  });

  onMount(() => {
    const {channel, cleanup} =
      createThemeBroadcastSubscription(
        cookieName,
        value => {
          if (!value) {
            setThemeState(() =>
              resolvedDefaultTheme(),
            );
            return;
          }

          setThemeState(
            () =>
              value as
                | WithSystem<TTheme, TEnableSystem>
                | undefined,
          );
        },
      );
    broadcastChannel = channel;

    onCleanup(() => {
      cleanup();
      if (broadcastChannel === channel) {
        broadcastChannel = null;
      }
    });
  });

  if (!isServer) {
    createEffect(() => {
      applyTheme(props.forcedTheme ?? theme());
    });
  }

  const providerValue: ThemeResult<
    TTheme,
    TEnableSystem
  > = {
    theme,
    setTheme,
    forcedTheme: () => props.forcedTheme,
    resolvedTheme,
    themes: availableThemes,
    colorScheme,
  };

  return createComponent(ThemeContext.Provider, {
    value:
      providerValue as unknown as ThemeContextValue,
    get children() {
      return props.children;
    },
  });
};

export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeOptions,
  WithSystem,
} from './types';
