import {
  disableThemeTransitions,
  updateThemeAttributes,
  updateThemeColorScheme,
} from './theme-dom';
import {
  createThemeBroadcastSubscription,
  defaultThemes,
  getCookieName,
  getCookieValue,
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
  ThemeState,
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
  disableTransition?: boolean | undefined;
  initial?:
    | ThemeState<TTheme, TEnableSystem>
    | undefined;
  nonce?: string | undefined;
}

type DefaultThemeControllerOptions<
  TEnableSystem extends boolean = true,
> = ThemeControllerOptions<LightOrDark, TEnableSystem>;

type CustomThemeControllerOptions<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = Omit<
  ThemeControllerOptions<TTheme, TEnableSystem>,
  'themes'
> & {
  themes: readonly TTheme[];
};

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
  selected:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  forced: TTheme | undefined;
  resolved: Exclude<TTheme, 'system'> | undefined;
  system: LightOrDark | undefined;
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
  setSelected: (
    value: ThemeControllerSetValue<
      TTheme,
      TEnableSystem
    >,
  ) => void;
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
  disableTransition?: boolean | undefined;
  enableColorScheme?: boolean | undefined;
  enableSystem?:
    | ThemeControllerOptions<
        TTheme,
        TEnableSystem
      >['enableSystem']
    | undefined;
  forced?: TTheme | undefined;
  initial?:
    | ThemeState<TTheme, TEnableSystem>
    | undefined;
  nonce?: string | undefined;
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
  selected:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  resolved: LiteralTheme<TTheme> | undefined;
  system: LightOrDark | undefined;
};

type NormalizedThemeControllerOptions<
  TTheme extends string,
  TEnableSystem extends boolean,
> = ThemeControllerOptions<TTheme, TEnableSystem> & {
  attributes: readonly Attribute[];
  cookieName: string;
  disableTransition: boolean;
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
  disableTransition: options.disableTransition,
  enableColorScheme: options.enableColorScheme,
  enableSystem: options.enableSystem,
  forced: options.forced,
  initial: options.initial,
  nonce: options.nonce,
  themes: options.themes,
  valueMap: options.valueMap,
});

const validateThemeNames = (
  themes: readonly string[],
) => {
  const invalidThemes = themes.filter(theme =>
    theme.includes('~'),
  );

  if (invalidThemes.length === 0) {
    return;
  }

  const quotedThemes = invalidThemes
    .map(theme => `"${theme}"`)
    .join(', ');
  const plural = invalidThemes.length === 1 ? '' : 's';

  throw new Error(
    `Invalid theme name${plural} ${quotedThemes}. Theme names cannot contain "~" because ssr-themes uses values like "dark~d" and "~l" internally. Rename the theme${plural}.`,
  );
};

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
    defaultThemes) as readonly TTheme[];
  const attribute = options.attribute ?? 'class';
  const enableSystemValue = (options.enableSystem ??
    true) as TEnableSystem;

  if (!isServer) {
    validateThemeNames(themeNames);
  }

  return {
    ...options,
    attributes: Array.isArray(attribute)
      ? attribute
      : [attribute],
    cookieName: getCookieName(options.cookie),
    disableTransition:
      options.disableTransition ?? true,
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
  system?: LightOrDark,
  resolved?: TTheme,
) => {
  if (system) {
    return system;
  }

  if (resolved === 'light' || resolved === 'dark') {
    return resolved;
  }

  if (!isServer) {
    return getSystemTheme();
  }

  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  if (!theme || theme === 'system') {
    return undefined;
  }

  return undefined;
};

export function createThemeController<
  TEnableSystem extends boolean = true,
>(
  initialOptions?: DefaultThemeControllerOptions<TEnableSystem>,
): ThemeController<LightOrDark, TEnableSystem>;

export function createThemeController<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  initialOptions: CustomThemeControllerOptions<
    TTheme,
    TEnableSystem
  >,
): ThemeController<TTheme, TEnableSystem>;

export function createThemeController(
  initialOptions: ThemeControllerOptions<
    string,
    boolean
  >,
): ThemeController<string, boolean>;

export function createThemeController<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  initialOptions: ThemeControllerOptions<
    TTheme,
    TEnableSystem
  > = {},
): ThemeController<TTheme, TEnableSystem> {
  let options = normalizeOptions(initialOptions);
  let theme = getTheme(
    options.cookieName,
    options.resolvedDefaultTheme,
    options.initial?.selected,
    options.themeNames,
    options.enableSystemValue,
  );
  let systemTheme = getInitialSystemTheme<TTheme>(
    theme,
    options.initial?.system,
    options.initial?.resolved,
  );
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

    const selectedTheme = normalizeThemeValue(
      options.forced ?? nextTheme,
    );

    return {
      selected: nextTheme,
      resolved: resolveThemeValue(selectedTheme),
      system: systemTheme as LightOrDark | undefined,
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
      options.disableTransition
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
      applyResolvedTheme(state.resolved);
    }

    snapshot = {
      selected: state.selected,
      forced: options.forced,
      resolved: state.resolved,
      system: state.system,
      themes: options.publicThemes,
    };

    for (const listener of listeners) {
      listener();
    }
  };

  const hasStoredTheme = () =>
    !isServer &&
    getCookieValue(options.cookieName) !== undefined;

  const shouldPersistThemeState = () =>
    options.enableSystemValue &&
    !options.forced &&
    theme !== undefined &&
    (theme === 'system' || hasStoredTheme());

  const getCookieColorScheme = ():
    | LightOrDark
    | undefined =>
    (systemTheme ??
      (!isServer ? getSystemTheme() : undefined)) as
      | LightOrDark
      | undefined;

  const getCookieState = (
    nextTheme:
      | WithSystem<TTheme, TEnableSystem>
      | undefined,
  ) => {
    if (!nextTheme) {
      return undefined;
    }

    const colorScheme = getCookieColorScheme();

    return {
      selected: nextTheme,
      resolved:
        nextTheme === 'system'
          ? (colorScheme as TTheme | undefined)
          : (nextTheme as TTheme),
      system: colorScheme,
    };
  };

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
    systemTheme = getSystemTheme(event);

    if (shouldPersistThemeState()) {
      const cookieState = getCookieState(theme);

      if (!cookieState) {
        publish();
        return;
      }

      saveToCookie(
        options.cookieName,
        cookieState,
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

  const setSelected = (
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
    const cookieState = getCookieState(nextTheme);

    if (cookieState) {
      saveToCookie(
        options.cookieName,
        cookieState,
        options.cookie,
      );
    }
    postThemeBroadcast(
      broadcastChannel,
      options.cookieName,
      nextTheme,
    );

    if (started) {
      publish();
      return;
    }

    publish();
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
    systemTheme = getSystemTheme();
    cleanupSystemTheme = subscribeToSystemTheme(
      handleSystemTheme,
      false,
    );
    openBroadcastChannel();

    if (shouldPersistThemeState()) {
      const cookieState = getCookieState(theme);

      if (!cookieState) {
        publish();
        return;
      }

      saveToCookie(
        options.cookieName,
        cookieState,
        options.cookie,
      );
    }

    publish();
  };

  const stop = () => {
    if (!started) {
      return;
    }

    if (options.forced) {
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

    if (!started) {
      systemTheme = getInitialSystemTheme<TTheme>(
        theme,
        options.initial?.system,
        options.initial?.resolved,
      );
    }

    if (
      theme === undefined &&
      options.initial?.selected !== undefined
    ) {
      theme = normalizeThemeValue(
        options.initial.selected,
      );

      if (!started) {
        systemTheme = getInitialSystemTheme<TTheme>(
          theme,
          options.initial?.system,
          options.initial?.resolved,
        );
      }
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
    setSelected,
    start,
    stop,
    subscribe,
    update,
  };
}
