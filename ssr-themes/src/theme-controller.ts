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
  LightOrDark,
  ThemeOptions,
  ThemeScriptRuntimeOptions,
  WithSystem,
} from './types';

const isServer = typeof window === 'undefined';

export interface ThemeControllerOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>
  extends
    ThemeOptions<TTheme, TEnableSystem>,
    ThemeScriptRuntimeOptions<TTheme> {
  disableTransitionOnChange?: boolean | undefined;
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string | undefined;
}

export type ThemeControllerSetValue<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> =
  | WithSystem<TTheme, TEnableSystem>
  | ((
      previous: WithSystem<TTheme, TEnableSystem>,
    ) => WithSystem<TTheme, TEnableSystem>);

export interface ThemeControllerSnapshot<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  theme: WithSystem<TTheme, TEnableSystem> | undefined;
  forcedTheme: TTheme | undefined;
  resolvedTheme: Exclude<TTheme, 'system'> | undefined;
  colorScheme: TEnableSystem extends false
    ? undefined
    : LightOrDark | undefined;
  themes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
}

export interface ThemeController<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  getSnapshot: () => ThemeControllerSnapshot<
    TTheme,
    TEnableSystem
  >;
  setTheme: (
    value: ThemeControllerSetValue<
      TTheme,
      TEnableSystem
    >,
  ) => WithSystem<TTheme, TEnableSystem>;
  start: () => void;
  stop: () => void;
  subscribe: (listener: () => void) => () => void;
  update: (
    options: ThemeControllerOptions<
      TTheme,
      TEnableSystem
    >,
  ) => void;
}

type ThemeControllerOptionSource<
  TTheme extends string,
  TEnableSystem extends boolean,
> = {
  attribute?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['attribute']
    | undefined;
  cookie?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['cookie']
    | undefined;
  defaultTheme?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['defaultTheme']
    | undefined;
  disableTransitionOnChange?: boolean | undefined;
  enableColorScheme?: boolean | undefined;
  enableSystem?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['enableSystem']
    | undefined;
  forcedTheme?: TTheme | undefined;
  nonce?: string | undefined;
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  themes?: readonly TTheme[] | undefined;
  valueMap?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['valueMap']
    | undefined;
};

type LiteralTheme<TTheme extends string> = Exclude<
  TTheme,
  'system'
>;

type ResolvedThemeState<
  TTheme extends string,
  TEnableSystem extends boolean,
> = {
  appliedTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  colorScheme: LightOrDark | undefined;
  resolvedTheme: LiteralTheme<TTheme> | undefined;
  theme: WithSystem<TTheme, TEnableSystem> | undefined;
};

type NormalizedThemeControllerOptions<
  TTheme extends string,
  TEnableSystem extends boolean,
> = ThemeControllerOptions<TTheme, TEnableSystem> & {
  attributes: readonly Attribute[];
  cookieName: string;
  disableTransitionOnChange: boolean;
  enableColorScheme: boolean;
  enableSystemValue: TEnableSystem;
  publicThemes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  resolvedDefaultTheme: WithSystem<
    TTheme,
    TEnableSystem
  >;
  themeNames: readonly TTheme[];
  themeValues: readonly string[];
};

export const pickThemeControllerOptions = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  options: ThemeControllerOptionSource<
    TTheme,
    TEnableSystem
  >,
): ThemeControllerOptions<TTheme, TEnableSystem> => ({
  attribute: options.attribute,
  cookie: options.cookie,
  defaultTheme: options.defaultTheme,
  disableTransitionOnChange:
    options.disableTransitionOnChange,
  enableColorScheme: options.enableColorScheme,
  enableSystem: options.enableSystem,
  forcedTheme: options.forcedTheme,
  nonce: options.nonce,
  selectedTheme: options.selectedTheme,
  themes: options.themes,
  valueMap: options.valueMap,
});

const normalizeOptions = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  options: ThemeControllerOptions<
    TTheme,
    TEnableSystem
  >,
): NormalizedThemeControllerOptions<
  TTheme,
  TEnableSystem
> => {
  const themeNames = (options.themes ??
    (defaultThemes as unknown as readonly TTheme[])) as readonly TTheme[];
  const attribute = options.attribute ?? 'class';
  const enableSystemValue = (options.enableSystem ??
    true) as TEnableSystem;

  return {
    ...options,
    attributes: Array.isArray(attribute)
      ? attribute
      : [attribute],
    cookieName: getCookieName(options.cookie),
    disableTransitionOnChange:
      options.disableTransitionOnChange ?? true,
    enableColorScheme:
      options.enableColorScheme ?? true,
    enableSystemValue,
    publicThemes: (enableSystemValue
      ? [...themeNames, 'system']
      : themeNames) as ReadonlyArray<
      WithSystem<TTheme, TEnableSystem>
    >,
    resolvedDefaultTheme: resolveDefaultTheme<
      TTheme,
      TEnableSystem
    >(options.defaultTheme, enableSystemValue),
    themeNames,
    themeValues: (!options.valueMap
      ? themeNames
      : Object.values(options.valueMap).filter(
          (value): value is string => Boolean(value),
        )) as readonly string[],
  };
};

const getInitialSystemTheme = <TTheme extends string>(
  theme: TTheme | 'system' | undefined,
) => {
  if (!isServer) {
    return getSystemTheme() as Exclude<
      TTheme,
      'system'
    >;
  }

  if (!theme || theme === 'system') {
    return undefined;
  }

  return theme as Exclude<TTheme, 'system'>;
};

export const createThemeController = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  initialOptions: ThemeControllerOptions<
    TTheme,
    TEnableSystem
  >,
): ThemeController<TTheme, TEnableSystem> => {
  let options = normalizeOptions(initialOptions);
  let theme = getTheme(
    options.cookieName,
    options.resolvedDefaultTheme,
    options.selectedTheme,
    options.themeNames,
    options.enableSystemValue,
  );
  let systemTheme =
    getInitialSystemTheme<TTheme>(theme);
  let snapshot: ThemeControllerSnapshot<
    TTheme,
    TEnableSystem
  >;
  let started = false;
  let broadcastChannel: BroadcastChannel | null = null;
  let cleanupBroadcast = () => {};
  let cleanupSystemTheme = () => {};
  const listeners = new Set<() => void>();

  const getFallbackLiteralTheme = () =>
    (systemTheme ??
      (options.resolvedDefaultTheme === 'system'
        ? undefined
        : options.resolvedDefaultTheme)) as
      | LiteralTheme<TTheme>
      | undefined;

  const normalizeThemeValue = (
    value:
      | WithSystem<TTheme, TEnableSystem>
      | undefined,
  ) => {
    if (
      value !== 'system' ||
      options.enableSystemValue
    ) {
      return value;
    }

    return getFallbackLiteralTheme() as
      | WithSystem<TTheme, TEnableSystem>
      | undefined;
  };

  const resolveThemeValue = (
    value:
      | WithSystem<TTheme, TEnableSystem>
      | undefined,
  ) => {
    const normalizedValue = normalizeThemeValue(value);

    if (!normalizedValue) {
      return undefined;
    }

    if (normalizedValue === 'system') {
      return getFallbackLiteralTheme();
    }

    return normalizedValue as LiteralTheme<TTheme>;
  };

  const getResolvedState = (): ResolvedThemeState<
    TTheme,
    TEnableSystem
  > => {
    const nextTheme = normalizeThemeValue(theme);

    if (nextTheme !== theme) {
      theme = nextTheme;
    }

    const appliedTheme = normalizeThemeValue(
      options.forcedTheme ?? nextTheme,
    );

    return {
      appliedTheme,
      colorScheme: options.enableSystemValue
        ? (systemTheme as LightOrDark | undefined)
        : undefined,
      resolvedTheme: resolveThemeValue(appliedTheme),
      theme: nextTheme,
    };
  };

  const applyResolvedTheme = (
    resolvedTheme: LiteralTheme<TTheme> | undefined,
  ) => {
    if (!resolvedTheme || isServer) {
      return;
    }

    const nextName = options.valueMap
      ? options.valueMap[resolvedTheme as TTheme]
      : resolvedTheme;
    const restoreTransitions =
      options.disableTransitionOnChange
        ? disableThemeTransitions(options.nonce)
        : null;
    const element = document.documentElement;

    updateThemeAttributes(
      element,
      options.attributes,
      options.themeValues,
      nextName,
    );
    updateThemeColorScheme(
      element,
      resolvedTheme as TTheme,
      options.enableColorScheme,
    );

    restoreTransitions?.();
  };

  const publish = () => {
    const state = getResolvedState();

    if (started) {
      applyResolvedTheme(state.resolvedTheme);
    }

    snapshot = {
      theme: state.theme,
      forcedTheme: options.forcedTheme,
      resolvedTheme: state.resolvedTheme,
      colorScheme:
        state.colorScheme as TEnableSystem extends false
          ? undefined
          : LightOrDark | undefined,
      themes: options.publicThemes,
    };

    for (const listener of listeners) {
      listener();
    }
  };

  const shouldPersistSystemTheme = () =>
    theme === 'system' &&
    options.enableSystemValue &&
    !options.forcedTheme;

  const restoreStoredTheme = () => {
    const nextTheme = normalizeThemeValue(theme);

    if (nextTheme !== theme) {
      theme = nextTheme;
    }

    applyResolvedTheme(resolveThemeValue(nextTheme));
  };

  const handleSystemTheme = (
    event: MediaQueryList | MediaQueryListEvent,
  ) => {
    systemTheme = getSystemTheme(
      event,
    ) as LiteralTheme<TTheme>;

    if (shouldPersistSystemTheme()) {
      saveToCookie(
        options.cookieName,
        'system',
        options.cookie,
      );
    }

    publish();
  };

  const openBroadcastChannel = () => {
    cleanupBroadcast();

    const {channel, cleanup} =
      createThemeBroadcastSubscription(
        options.cookieName,
        value => {
          theme = normalizeThemeValue(
            value
              ? (value as WithSystem<
                  TTheme,
                  TEnableSystem
                >)
              : options.resolvedDefaultTheme,
          );

          publish();
        },
      );
    broadcastChannel = channel;
    cleanupBroadcast = () => {
      cleanup();
      if (broadcastChannel === channel) {
        broadcastChannel = null;
      }
    };
  };

  const setTheme = (
    value: ThemeControllerSetValue<
      TTheme,
      TEnableSystem
    >,
  ) => {
    const previousTheme = (normalizeThemeValue(
      theme ?? options.resolvedDefaultTheme,
    ) ?? options.resolvedDefaultTheme) as WithSystem<
      TTheme,
      TEnableSystem
    >;
    const nextTheme = normalizeThemeValue(
      typeof value === 'function'
        ? value(previousTheme)
        : value,
    ) as WithSystem<TTheme, TEnableSystem>;

    theme = nextTheme;
    saveToCookie(
      options.cookieName,
      nextTheme,
      options.cookie,
    );
    postThemeBroadcast(
      broadcastChannel,
      options.cookieName,
      nextTheme,
    );

    if (started) {
      publish();
      return nextTheme;
    }

    publish();
    return nextTheme;
  };

  const start = () => {
    if (started) {
      publish();
      return;
    }

    if (isServer) {
      publish();
      return;
    }

    started = true;
    systemTheme =
      getSystemTheme() as LiteralTheme<TTheme>;
    cleanupSystemTheme = subscribeToSystemTheme(
      handleSystemTheme,
      false,
    );
    openBroadcastChannel();

    if (shouldPersistSystemTheme()) {
      saveToCookie(
        options.cookieName,
        'system',
        options.cookie,
      );
    }

    publish();
  };

  const stop = () => {
    if (!started) {
      return;
    }

    if (options.forcedTheme) {
      restoreStoredTheme();
    }

    cleanupSystemTheme();
    cleanupBroadcast();
    started = false;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  const update = (
    nextOptions: ThemeControllerOptions<
      TTheme,
      TEnableSystem
    >,
  ) => {
    const previousCookieName = options.cookieName;
    options = normalizeOptions(nextOptions);
    theme = normalizeThemeValue(theme);

    if (
      theme === undefined &&
      options.selectedTheme !== undefined
    ) {
      theme = normalizeThemeValue(
        options.selectedTheme,
      );
    }

    if (
      started &&
      previousCookieName !== options.cookieName
    ) {
      openBroadcastChannel();
    }

    publish();
  };

  publish();

  return {
    getSnapshot: () => snapshot,
    setTheme,
    start,
    stop,
    subscribe,
    update,
  };
};
