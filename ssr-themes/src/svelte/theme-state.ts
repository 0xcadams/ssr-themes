import {readonly, writable} from 'svelte/store';
import {
  disableThemeTransitions,
  updateThemeAttributes,
  updateThemeColorScheme,
} from '../theme-dom';
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
} from '../theme-runtime';
import type {
  Attribute,
  LightOrDark,
  WithSystem,
} from '../types';
import type {
  SetThemeValue,
  ThemeContext,
  ThemeProviderProps,
} from './types.js';

type ThemeControllerOptions<
  TTheme extends string,
  TEnableSystem extends boolean,
> = ThemeProviderProps<TTheme, TEnableSystem> & {
  attributes: readonly Attribute[];
  attrs: readonly string[];
  cookieName: string;
  enableSystemValue: TEnableSystem;
  publicThemes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  resolvedDefaultTheme: WithSystem<
    TTheme,
    TEnableSystem
  >;
  themesValue: readonly TTheme[];
};

type ThemeController<
  TTheme extends string,
  TEnableSystem extends boolean,
> = {
  context: ThemeContext<TTheme, TEnableSystem>;
  destroy: () => void;
  start: () => void;
  update: (
    nextOptions: ThemeProviderProps<
      TTheme,
      TEnableSystem
    >,
  ) => void;
};

const isServer = typeof window === 'undefined';

const normalizeOptions = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  options: ThemeProviderProps<TTheme, TEnableSystem>,
): ThemeControllerOptions<TTheme, TEnableSystem> => {
  const themesValue = (options.themes ??
    (defaultThemes as unknown as readonly TTheme[])) as readonly TTheme[];
  const attribute = options.attribute ?? 'class';
  const enableSystemValue = (options.enableSystem ??
    true) as TEnableSystem;

  return {
    ...options,
    attribute,
    attributes: Array.isArray(attribute)
      ? attribute
      : [attribute],
    attrs: (!options.valueMap
      ? themesValue
      : Object.values(options.valueMap).filter(
          (value): value is string => Boolean(value),
        )) as readonly string[],
    cookieName: getCookieName(options.cookie),
    enableSystemValue,
    publicThemes: (enableSystemValue
      ? [...themesValue, 'system']
      : themesValue) as ReadonlyArray<
      WithSystem<TTheme, TEnableSystem>
    >,
    resolvedDefaultTheme: resolveDefaultTheme<
      TTheme,
      TEnableSystem
    >(options.defaultTheme, enableSystemValue),
    themesValue,
  };
};

export const createThemeController = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  initialOptions: ThemeProviderProps<
    TTheme,
    TEnableSystem
  >,
): ThemeController<TTheme, TEnableSystem> => {
  let options = normalizeOptions(initialOptions);
  let theme = getTheme(
    options.cookieName,
    options.resolvedDefaultTheme,
    options.selectedTheme,
    options.themesValue,
    options.enableSystemValue,
  );
  let systemTheme = !isServer
    ? (getSystemTheme() as Exclude<TTheme, 'system'>)
    : (theme as Exclude<TTheme, 'system'> | undefined);
  let broadcastChannel: BroadcastChannel | null = null;
  let cleanupBroadcast = () => {};
  let cleanupSystemTheme = () => {};
  let started = false;

  const themeStore = writable<
    WithSystem<TTheme, TEnableSystem> | undefined
  >(theme);
  const forcedThemeStore = writable<
    TTheme | undefined
  >(options.forcedTheme);
  const resolvedThemeStore = writable<
    Exclude<TTheme, 'system'> | undefined
  >();
  const colorSchemeStore =
    writable<
      TEnableSystem extends true
        ? LightOrDark | undefined
        : undefined
    >();
  const themesStore = writable<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >(options.publicThemes);

  const updateDerivedStores = () => {
    const appliedTheme = options.forcedTheme ?? theme;
    const resolvedTheme =
      appliedTheme === 'system' &&
      options.enableSystemValue
        ? systemTheme
        : (appliedTheme as
            | Exclude<TTheme, 'system'>
            | undefined);

    forcedThemeStore.set(options.forcedTheme);
    themesStore.set(options.publicThemes);
    resolvedThemeStore.set(resolvedTheme);
    colorSchemeStore.set(
      (options.enableSystemValue
        ? (systemTheme as LightOrDark | undefined)
        : undefined) as TEnableSystem extends true
        ? LightOrDark | undefined
        : undefined,
    );
  };

  const applyTheme = (
    value:
      | WithSystem<TTheme, TEnableSystem>
      | undefined,
  ) => {
    if (!value || isServer) {
      updateDerivedStores();
      return value;
    }

    let resolved = value;
    if (
      resolved === 'system' &&
      options.enableSystemValue
    ) {
      resolved = getSystemTheme() as TTheme;
    }

    const resolvedTheme = resolved as TTheme;
    const name = options.valueMap
      ? options.valueMap[resolvedTheme]
      : resolvedTheme;
    const restoreTransitions =
      (options.disableTransitionOnChange ?? true)
        ? disableThemeTransitions(options.nonce)
        : null;
    const element = document.documentElement;

    updateThemeAttributes(
      element,
      options.attributes,
      options.attrs,
      name,
    );
    updateThemeColorScheme(
      element,
      resolvedTheme,
      options.enableColorScheme ?? true,
    );

    restoreTransitions?.();
    updateDerivedStores();
    return resolved;
  };

  const openBroadcastChannel = () => {
    cleanupBroadcast();

    const {channel, cleanup} =
      createThemeBroadcastSubscription(
        options.cookieName,
        value => {
          if (!value) {
            theme = options.resolvedDefaultTheme;
          } else {
            theme = value as
              | WithSystem<TTheme, TEnableSystem>
              | undefined;
          }

          themeStore.set(theme);

          if (started) {
            applyTheme(options.forcedTheme ?? theme);
            return;
          }

          updateDerivedStores();
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
    value: SetThemeValue<TTheme, TEnableSystem>,
  ) => {
    const nextTheme =
      typeof value === 'function'
        ? value(
            (theme ??
              options.resolvedDefaultTheme) as WithSystem<
              TTheme,
              TEnableSystem
            >,
          )
        : value;

    theme = nextTheme;
    themeStore.set(theme);
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
      applyTheme(options.forcedTheme ?? theme);
      return;
    }

    updateDerivedStores();
  };

  const start = () => {
    if (started || isServer) {
      updateDerivedStores();
      return;
    }

    started = true;
    cleanupSystemTheme = subscribeToSystemTheme(
      event => {
        systemTheme = getSystemTheme(event) as Exclude<
          TTheme,
          'system'
        >;
        const isChangeEvent = 'type' in event;
        const hasSystemCookie =
          getTheme<TTheme, TEnableSystem>(
            options.cookieName,
            undefined,
            undefined,
            options.themesValue,
            options.enableSystemValue,
          ) === 'system';
        updateDerivedStores();

        if (
          (isChangeEvent || hasSystemCookie) &&
          theme === 'system' &&
          options.enableSystemValue &&
          !options.forcedTheme
        ) {
          saveToCookie(
            options.cookieName,
            'system',
            options.cookie,
          );
          applyTheme(
            'system' as WithSystem<
              TTheme,
              TEnableSystem
            >,
          );
        }
      },
    );
    openBroadcastChannel();
    applyTheme(options.forcedTheme ?? theme);
  };

  const update = (
    nextOptions: ThemeProviderProps<
      TTheme,
      TEnableSystem
    >,
  ) => {
    const previousCookieName = options.cookieName;
    options = normalizeOptions(nextOptions);

    if (
      theme === undefined &&
      options.selectedTheme !== undefined
    ) {
      theme = options.selectedTheme;
      themeStore.set(theme);
    }

    if (
      started &&
      previousCookieName !== options.cookieName
    ) {
      openBroadcastChannel();
    }

    if (started) {
      applyTheme(options.forcedTheme ?? theme);
      return;
    }

    updateDerivedStores();
  };

  const destroy = () => {
    cleanupSystemTheme();
    cleanupBroadcast();
    started = false;
  };

  updateDerivedStores();

  return {
    context: {
      theme: readonly(themeStore),
      forcedTheme: readonly(forcedThemeStore),
      resolvedTheme: readonly(resolvedThemeStore),
      colorScheme: readonly(colorSchemeStore),
      themes: readonly(themesStore),
      setTheme,
    },
    destroy,
    start,
    update,
  };
};
