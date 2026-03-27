'use client';

import * as React from 'react';
import type {
  Attribute,
  CookieOptions,
  WithSystem,
  ThemeProviderProps,
  ThemeResult,
  LightOrDark,
  LightOrDarkTuple,
} from './types';

const colorSchemes = ['light', 'dark'];
const MEDIA = '(prefers-color-scheme: dark)';
const isServer = typeof window === 'undefined';
const ThemeContext = React.createContext<
  ThemeResult<string, boolean> | undefined
>(undefined);
const defaultContext: ThemeResult<LightOrDark, true> =
  {
    setTheme: _ => {},
    themes: [] as WithSystem<LightOrDark, true>[],
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
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() =>
  (React.useContext(ThemeContext) ??
    defaultContext) as ThemeResult<
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

const defaultThemes = [
  'dark',
  'light',
] as const satisfies LightOrDarkTuple;

const Theme = <
  TTheme extends string = LightOrDark,
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
  valueMap,
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
      : 'light') as WithSystem<TTheme, TEnableSystem>);
  const cookieName = getCookieName(cookie);
  const [theme, setThemeState] = React.useState<
    WithSystem<TTheme, TEnableSystem> | undefined
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
        ? (getBaseTheme() as TTheme)
        : (theme as TTheme),
    );
  const attrs = (
    !valueMap ? themes : Object.values(valueMap)
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
        | WithSystem<TTheme, TEnableSystem>
        | undefined,
    ):
      | WithSystem<TTheme, TEnableSystem>
      | undefined => {
      let resolved = theme;
      if (!resolved) return undefined;

      // If theme is system, resolve it before setting theme
      if (resolved === 'system' && enableSystemValue) {
        resolved = getBaseTheme() as TTheme;
      }

      const resolvedTheme = resolved as TTheme;
      const name = valueMap
        ? valueMap[resolvedTheme]
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
      valueMap,
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
      const resolved = getBaseTheme(e) as TTheme;
      setResolvedTheme(resolved);

      if (
        theme === 'system' &&
        enableSystemValue &&
        !forcedTheme
      ) {
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
          | WithSystem<TTheme, TEnableSystem>
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
      value={providerValue as unknown as ThemeResult}
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
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  initialTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
) {
  if (isServer) return initialTheme;
  if (initialTheme) return initialTheme;
  let theme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  try {
    theme = getCookieValue(cookieName) as WithSystem<
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

const getBaseTheme = (
  e?: MediaQueryList | MediaQueryListEvent,
): LightOrDark => {
  if (!e) {
    e = window.matchMedia(MEDIA);
  }
  const isDark = e.matches;
  const colorScheme = isDark ? 'dark' : 'light';
  return colorScheme;
};

export type {
  Attribute,
  CookieOptions,
  RegisterThemeOptions,
  ThemeHtmlProps,
  WithSystem,
  ThemeOptions,
  ThemeProviderProps,
  ThemeResult,
  LightOrDark,
} from './types';
export {themeScript} from './theme-script';
export {registerTheme} from './register-theme';
