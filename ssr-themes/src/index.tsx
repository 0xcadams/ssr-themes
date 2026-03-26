'use client';

import * as React from 'react';
import type {
  Attribute,
  CookieOptions,
  SystemTheme,
  SystemThemeDefinition,
  ThemeName,
  ThemeProviderProps,
  UseThemeProps,
} from './types';

const colorSchemes = ['light', 'dark'];
const MEDIA = '(prefers-color-scheme: dark)';
const isServer = typeof window === 'undefined';
const ThemeContext = React.createContext<
  UseThemeProps<string, boolean> | undefined
>(undefined);
const defaultContext: UseThemeProps<
  SystemTheme,
  true
> = {
  setTheme: _ => {},
  themes: [] as ThemeName<SystemTheme, true>[],
};

const defaultCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax',
};

const getCookieName = (cookie?: CookieOptions) =>
  cookie?.name ?? 'theme';

const getCookieValue = (key: string) => {
  if (isServer) return undefined;
  const cookies = document.cookie
    ? document.cookie.split('; ')
    : [];
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=');
    if (name === key) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

const formatSameSite = (
  sameSite?: CookieOptions['sameSite'],
) => {
  if (!sameSite) return undefined;
  return `${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`;
};

const saveToCookie = (
  cookieName: string,
  value: string,
  options?: CookieOptions,
) => {
  try {
    const cookieOptions = {
      ...defaultCookieOptions,
      ...(options ?? {}),
    };
    const cookieValue = encodeURIComponent(value);
    const parts = [`${cookieName}=${cookieValue}`];

    if (cookieOptions.path) {
      parts.push(`Path=${cookieOptions.path}`);
    }

    if (cookieOptions.domain) {
      parts.push(`Domain=${cookieOptions.domain}`);
    }

    if (typeof cookieOptions.maxAge === 'number') {
      parts.push(`Max-Age=${cookieOptions.maxAge}`);
    }

    if (cookieOptions.expires) {
      parts.push(
        `Expires=${cookieOptions.expires.toUTCString()}`,
      );
    }

    const sameSite = formatSameSite(
      cookieOptions.sameSite,
    );
    if (sameSite) {
      parts.push(`SameSite=${sameSite}`);
    }

    if (cookieOptions.secure) {
      parts.push('Secure');
    }

    document.cookie = parts.join('; ');
  } catch (e) {
    // Unsupported
  }
};

export const useTheme = <
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
>() =>
  (React.useContext(ThemeContext) ??
    defaultContext) as UseThemeProps<
    TTheme,
    TEnableSystem
  >;

export const ThemeProvider = <
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const context = React.useContext(ThemeContext);

  // Ignore nested context providers
  if (context) return <>{props.children}</>;
  return <Theme {...props} />;
};

const defaultThemes = [
  'dark',
  'light',
] as const satisfies SystemThemeDefinition;

const Theme = <
  TTheme extends string = SystemTheme,
  TEnableSystem extends boolean = true,
>({
  forcedTheme,
  disableTransitionOnChange = true,
  enableColorScheme = true,
  cookie,
  initialTheme,
  themes = defaultThemes as unknown as readonly TTheme[],
  defaultTheme,
  attribute = 'class',
  value,
  children,
  nonce,
  enableSystem,
}: ThemeProviderProps<TTheme, TEnableSystem>) => {
  const enableSystemValue = (enableSystem ??
    true) as TEnableSystem;
  const resolvedDefaultTheme =
    defaultTheme ??
    ((enableSystemValue
      ? 'system'
      : 'light') as ThemeName<TTheme, TEnableSystem>);
  const cookieName = getCookieName(cookie);
  const [theme, setThemeState] = React.useState<
    ThemeName<TTheme, TEnableSystem> | undefined
  >(() =>
    getTheme(
      cookieName,
      resolvedDefaultTheme,
      initialTheme,
    ),
  );
  const [resolvedTheme, setResolvedTheme] =
    React.useState<TTheme | undefined>(() =>
      theme === 'system' && !isServer
        ? (getSystemTheme() as TTheme)
        : (theme as TTheme),
    );
  const attrs = (
    !value ? themes : Object.values(value)
  ) as readonly string[];
  const broadcastRef =
    React.useRef<BroadcastChannel | null>(null);
  const themeRef = React.useRef(theme);

  React.useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const applyTheme = React.useCallback(
    (
      theme:
        | ThemeName<TTheme, TEnableSystem>
        | undefined,
    ):
      | ThemeName<TTheme, TEnableSystem>
      | undefined => {
      let resolved = theme;
      if (!resolved) return undefined;

      // If theme is system, resolve it before setting theme
      if (resolved === 'system' && enableSystemValue) {
        resolved = getSystemTheme() as TTheme;
      }

      const resolvedTheme = resolved as TTheme;
      const name = value
        ? value[resolvedTheme]
        : resolvedTheme;
      const enable = disableTransitionOnChange
        ? disableAnimation(nonce)
        : null;
      const d = document.documentElement;

      const handleAttribute = (attr: Attribute) => {
        if (attr === 'class') {
          d.classList.remove(...attrs);
          if (name) d.classList.add(name);
        } else if (attr.startsWith('data-')) {
          if (name) {
            d.setAttribute(attr, name);
          } else {
            d.removeAttribute(attr);
          }
        }
      };

      if (Array.isArray(attribute)) {
        attribute.forEach(handleAttribute);
      } else {
        handleAttribute(attribute);
      }

      if (enableColorScheme) {
        const colorScheme = colorSchemes.includes(
          resolvedTheme,
        )
          ? resolvedTheme
          : '';
        d.style.colorScheme = colorScheme;
      }

      enable?.();
      return resolved;
    },
    [
      attribute,
      attrs,
      disableTransitionOnChange,
      enableColorScheme,
      enableSystemValue,
      nonce,
      value,
    ],
  );

  const broadcastTheme = React.useCallback(
    (value: string) => {
      broadcastRef.current?.postMessage({
        key: cookieName,
        value,
      });
    },
    [cookieName],
  );

  const setTheme = React.useCallback(
    (
      value:
        | ThemeName<TTheme, TEnableSystem>
        | React.SetStateAction<
            ThemeName<TTheme, TEnableSystem>
          >,
    ) => {
      if (typeof value === 'function') {
        setThemeState(prevTheme => {
          const newTheme = value(
            prevTheme as ThemeName<
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
      setResolvedTheme(resolved);

      if (
        theme === 'system' &&
        enableSystemValue &&
        !forcedTheme
      ) {
        applyTheme(
          'system' as ThemeName<TTheme, TEnableSystem>,
        );
      }
    },
    [
      applyTheme,
      enableSystemValue,
      forcedTheme,
      theme,
    ],
  );

  // Always listen to System preference
  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);

    // Intentionally use deprecated listener methods to support iOS & old browsers
    media.addListener(handleMediaQuery);
    handleMediaQuery(media);

    return () =>
      media.removeListener(handleMediaQuery);
  }, [handleMediaQuery]);

  // Cross-tab sync via BroadcastChannel
  React.useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.BroadcastChannel === 'undefined'
    ) {
      return;
    }

    const channel = new BroadcastChannel(
      `ssr-themes:${cookieName}`,
    );
    broadcastRef.current = channel;

    const handleMessage = (
      event: MessageEvent<{
        key: string;
        value?: string;
      }>,
    ) => {
      if (
        !event.data ||
        event.data.key !== cookieName
      ) {
        return;
      }

      if (!event.data.value) {
        setThemeState(resolvedDefaultTheme);
        return;
      }

      setThemeState(
        event.data.value as
          | ThemeName<TTheme, TEnableSystem>
          | undefined,
      );
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener(
        'message',
        handleMessage,
      );
      channel.close();
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
          ThemeName<TTheme, TEnableSystem>
        >,
        systemTheme: (enableSystemValue
          ? (resolvedTheme as unknown as SystemTheme)
          : undefined) as TEnableSystem extends true
          ? SystemTheme
          : undefined,
      }) as UseThemeProps<TTheme, TEnableSystem>,
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
      value={providerValue as unknown as UseThemeProps}
    >
      {children}
    </ThemeContext.Provider>
  );
};

function getTheme<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  cookieName: string,
  fallback:
    | ThemeName<TTheme, TEnableSystem>
    | undefined,
  initialTheme:
    | ThemeName<TTheme, TEnableSystem>
    | undefined,
) {
  if (isServer) return initialTheme;
  if (initialTheme) return initialTheme;
  let theme:
    | ThemeName<TTheme, TEnableSystem>
    | undefined;
  try {
    theme = getCookieValue(cookieName) as ThemeName<
      TTheme,
      TEnableSystem
    >;
  } catch (e) {
    // Unsupported
  }
  if (theme) return theme;

  return fallback;
}

const disableAnimation = (nonce?: string) => {
  const css = document.createElement('style');
  if (nonce) {
    css.setAttribute('nonce', nonce);
  }
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  );
  document.head.appendChild(css);

  return () => {
    // Force restyle
    (() => window.getComputedStyle(document.body))();

    // Wait for next tick before removing
    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
};

const getSystemTheme = (
  e?: MediaQueryList | MediaQueryListEvent,
): SystemTheme => {
  if (!e) {
    e = window.matchMedia(MEDIA);
  }
  const isDark = e.matches;
  const systemTheme = isDark ? 'dark' : 'light';
  return systemTheme;
};

export type {
  Attribute,
  CookieOptions,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeName,
  ThemeOptions,
  ThemeProviderProps,
  ThemeScriptOptions,
  UseThemeProps,
  SystemTheme,
} from './types';
export {themeScript} from './theme-script';
export {registerTheme} from './register-theme';
