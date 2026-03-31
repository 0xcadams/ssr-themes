'use client';

import * as React from 'react';
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

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** List of all available theme names */
  themes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  /** Forced theme name for the current page */
  forcedTheme?: TTheme | undefined;
  /** Update the theme */
  setTheme: React.Dispatch<
    React.SetStateAction<
      WithSystem<TTheme, TEnableSystem>
    >
  >;
  /** Active theme name */
  theme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?:
    | Exclude<TTheme, 'system'>
    | undefined;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  colorScheme?: TEnableSystem extends true
    ? LightOrDark
    : undefined;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeOptions<TTheme, TEnableSystem> {
  children?: React.ReactNode | undefined;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean | undefined;
  /** Selected theme name to use for server rendering */
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Nonce string to pass to the inline style elements for CSP headers */
  nonce?: string;
}

const isServer = typeof window === 'undefined';
type ThemeContextValue = ThemeResult<string, boolean>;

const ThemeContext = React.createContext<
  ThemeContextValue | undefined
>(undefined);
const defaultContext: ThemeContextValue = {
  setTheme: _ => {},
  themes: [],
};

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() =>
  (React.useContext(ThemeContext) ??
    defaultContext) as unknown as ThemeResult<
    TTheme,
    TEnableSystem
  >;

export const ThemeProvider = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const context = React.useContext(ThemeContext);

  // Ignore nested context providers
  if (context) return <>{props.children}</>;
  return <Theme {...props} />;
};

const Theme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>({
  forcedTheme,
  disableTransitionOnChange = true,
  enableColorScheme = true,
  cookie,
  selectedTheme,
  themes = defaultThemes as unknown as readonly TTheme[],
  defaultTheme,
  attribute = 'class',
  valueMap,
  children,
  nonce,
  enableSystem,
}: ThemeProviderProps<TTheme, TEnableSystem>) => {
  const enableSystemValue = (enableSystem ??
    true) as TEnableSystem;
  const resolvedDefaultTheme = resolveDefaultTheme<
    TTheme,
    TEnableSystem
  >(defaultTheme, enableSystemValue);
  const cookieName = getCookieName(cookie);
  const [theme, setThemeState] = React.useState<
    WithSystem<TTheme, TEnableSystem> | undefined
  >(() =>
    getTheme(
      cookieName,
      resolvedDefaultTheme,
      selectedTheme,
      themes,
      enableSystemValue,
    ),
  );
  const [resolvedTheme, setResolvedTheme] =
    React.useState<TTheme | undefined>(() =>
      theme === 'system' && !isServer
        ? (getSystemTheme() as TTheme)
        : (theme as TTheme),
    );
  const attrs = (
    !valueMap ? themes : Object.values(valueMap)
  ) as readonly string[];
  const attributes = React.useMemo(
    () =>
      Array.isArray(attribute)
        ? attribute
        : [attribute],
    [attribute],
  );
  const broadcastRef =
    React.useRef<BroadcastChannel | null>(null);
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  const applyTheme = React.useCallback(
    (
      theme:
        | WithSystem<TTheme, TEnableSystem>
        | undefined,
    ):
      | WithSystem<TTheme, TEnableSystem>
      | undefined => {
      let resolved = theme;
      if (!resolved) return undefined;

      // If theme is system, resolve it before setting theme
      if (resolved === 'system' && enableSystemValue) {
        resolved = getSystemTheme() as TTheme;
      }

      const resolvedTheme = resolved as TTheme;
      const name = valueMap
        ? valueMap[resolvedTheme]
        : resolvedTheme;
      const restoreTransitions =
        disableTransitionOnChange
          ? disableThemeTransitions(nonce)
          : null;
      const element = document.documentElement;

      updateThemeAttributes(
        element,
        attributes,
        attrs,
        name,
      );
      updateThemeColorScheme(
        element,
        resolvedTheme,
        enableColorScheme,
      );

      restoreTransitions?.();
      return resolved;
    },
    [
      attributes,
      attrs,
      disableTransitionOnChange,
      enableColorScheme,
      enableSystemValue,
      nonce,
      valueMap,
    ],
  );

  const broadcastTheme = React.useCallback(
    (value: string) => {
      postThemeBroadcast(
        broadcastRef.current,
        cookieName,
        value,
      );
    },
    [cookieName],
  );

  const setTheme = React.useCallback(
    (
      value:
        | WithSystem<TTheme, TEnableSystem>
        | React.SetStateAction<
            WithSystem<TTheme, TEnableSystem>
          >,
    ) => {
      if (typeof value === 'function') {
        setThemeState(prevTheme => {
          const newTheme = value(
            prevTheme as WithSystem<
              TTheme,
              TEnableSystem
            >,
          );

          saveToCookie(cookieName, newTheme, cookie);
          broadcastTheme(newTheme);

          return newTheme;
        });
      } else {
        setThemeState(value);
        saveToCookie(cookieName, value, cookie);
        broadcastTheme(value);
      }
    },
    [cookieName, cookie, broadcastTheme],
  );

  const handleMediaQuery = React.useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(e) as TTheme;
      const isChangeEvent = 'type' in e;
      const hasSystemCookie =
        getTheme<TTheme, TEnableSystem>(
          cookieName,
          undefined,
          undefined,
          themes,
          enableSystemValue,
        ) === 'system';
      setResolvedTheme(resolved);

      if (
        (isChangeEvent || hasSystemCookie) &&
        themeRef.current === 'system' &&
        enableSystemValue &&
        !forcedTheme
      ) {
        saveToCookie(cookieName, 'system', cookie);
        applyTheme(
          'system' as WithSystem<
            TTheme,
            TEnableSystem
          >,
        );
      }
    },
    [
      applyTheme,
      cookie,
      cookieName,
      enableSystemValue,
      forcedTheme,
      themes,
    ],
  );

  // Always listen to System preference
  React.useEffect(() => {
    return subscribeToSystemTheme(handleMediaQuery);
  }, [handleMediaQuery]);

  // Cross-tab sync via BroadcastChannel
  React.useEffect(() => {
    const {channel, cleanup} =
      createThemeBroadcastSubscription(
        cookieName,
        value => {
          if (!value) {
            setThemeState(resolvedDefaultTheme);
            return;
          }

          setThemeState(
            value as
              | WithSystem<TTheme, TEnableSystem>
              | undefined,
          );
        },
      );
    broadcastRef.current = channel;

    return () => {
      cleanup();
      if (broadcastRef.current === channel) {
        broadcastRef.current = null;
      }
    };
  }, [cookieName, resolvedDefaultTheme]);

  // Whenever theme or forcedTheme changes, apply it
  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme);
  }, [applyTheme, forcedTheme, theme]);

  React.useEffect(() => {
    if (!forcedTheme) return;

    return () => {
      applyTheme(themeRef.current);
    };
  }, [applyTheme, forcedTheme]);

  const appliedTheme = forcedTheme ?? theme;
  const resolved =
    appliedTheme === 'system' && enableSystemValue
      ? resolvedTheme
      : (appliedTheme as TTheme | undefined);

  const providerValue = React.useMemo(
    () =>
      ({
        theme,
        setTheme,
        forcedTheme,
        resolvedTheme: resolved,
        themes: (enableSystemValue
          ? [...themes, 'system']
          : themes) as ReadonlyArray<
          WithSystem<TTheme, TEnableSystem>
        >,
        colorScheme: (enableSystemValue
          ? (resolvedTheme as unknown as LightOrDark)
          : undefined) as TEnableSystem extends true
          ? LightOrDark
          : undefined,
      }) as ThemeResult<TTheme, TEnableSystem>,
    [
      theme,
      setTheme,
      forcedTheme,
      resolved,
      resolvedTheme,
      enableSystemValue,
      themes,
    ],
  );

  return (
    <ThemeContext.Provider
      value={
        providerValue as unknown as ThemeContextValue
      }
    >
      {children}
    </ThemeContext.Provider>
  );
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
