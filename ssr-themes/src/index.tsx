'use client';

import * as React from 'react';
import {script} from './script';
import type {
  Attribute,
  CookieConfig,
  CookieOptions,
  SystemTheme,
  SystemThemeDefinition,
  ThemeName,
  ThemeProviderProps,
  UseThemeProps,
} from './types';

export {registerTheme} from './register-theme';

const colorSchemes = ['light', 'dark'];
const MEDIA = '(prefers-color-scheme: dark)';
const isServer = typeof window === 'undefined';
const ThemeContext = React.createContext<UseThemeProps | undefined>(undefined);
const defaultContext: UseThemeProps = {
  setTheme: _ => {},
  themes: [] as unknown as SystemThemeDefinition,
};

const defaultCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax',
};

const getCookieName = (cookie?: CookieConfig) => cookie?.name ?? 'theme';

const getCookieValue = (key: string) => {
  if (isServer) return undefined;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=');
    if (name === key) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

const formatSameSite = (sameSite?: CookieOptions['sameSite']) => {
  if (!sameSite) return undefined;
  return `${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`;
};

const saveToCookie = (
  cookieName: string,
  value: string,
  options?: CookieOptions,
) => {
  try {
    const cookieOptions = {...defaultCookieOptions, ...(options ?? {})};
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
      parts.push(`Expires=${cookieOptions.expires.toUTCString()}`);
    }

    const sameSite = formatSameSite(cookieOptions.sameSite);
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

export const useTheme = () => React.useContext(ThemeContext) ?? defaultContext;

export const ThemeProvider = <
  TThemes extends readonly string[] = SystemThemeDefinition,
>(
  props: ThemeProviderProps<TThemes>,
) => {
  const context = React.useContext(ThemeContext);

  // Ignore nested context providers, just passthrough children
  if (context) return <>{props.children}</>;
  return <Theme {...props} />;
};

const defaultThemes = [
  'dark',
  'light',
] as const satisfies SystemThemeDefinition;

const Theme = <TThemes extends readonly string[] = SystemThemeDefinition>({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  cookie,
  themes = defaultThemes as unknown as TThemes,
  defaultTheme = enableSystem ? 'system' : 'light',
  attribute = 'class',
  value,
  children,
  nonce,
  scriptProps,
}: ThemeProviderProps<TThemes>) => {
  const cookieName = getCookieName(cookie);
  const [theme, setThemeState] = React.useState(() =>
    getTheme(cookieName, defaultTheme, attribute, value, themes),
  );
  const [resolvedTheme, setResolvedTheme] = React.useState(() =>
    theme === 'system' ? getSystemTheme() : theme,
  );
  const attrs = !value ? themes : Object.values(value);
  const broadcastRef = React.useRef<BroadcastChannel | null>(null);

  const applyTheme = React.useCallback(
    (theme): ThemeName<TThemes> => {
      let resolved = theme;
      if (!resolved) return;

      // If theme is system, resolve it before setting theme
      if (theme === 'system' && enableSystem) {
        resolved = getSystemTheme();
      }

      const name = value ? value[resolved] : resolved;
      const enable = disableTransitionOnChange ? disableAnimation(nonce) : null;
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
        const fallback = colorSchemes.includes(defaultTheme)
          ? defaultTheme
          : null;
        const colorScheme = colorSchemes.includes(resolved)
          ? resolved
          : fallback;
        // @ts-ignore
        d.style.colorScheme = colorScheme;
      }

      enable?.();
    },
    [nonce],
  );

  const broadcastTheme = React.useCallback(
    (value: string) => {
      broadcastRef.current?.postMessage({key: cookieName, value});
    },
    [cookieName],
  );

  const setTheme = React.useCallback(
    (value: ThemeName<TThemes> | React.SetStateAction<ThemeName<TThemes>>) => {
      if (typeof value === 'function') {
        setThemeState(prevTheme => {
          const newTheme = value(prevTheme);

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
      const resolved = getSystemTheme(e);
      setResolvedTheme(resolved);

      if (theme === 'system' && enableSystem && !forcedTheme) {
        applyTheme('system');
      }
    },
    [theme, forcedTheme],
  );

  // Always listen to System preference
  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);

    // Intentionally use deprecated listener methods to support iOS & old browsers
    media.addListener(handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeListener(handleMediaQuery);
  }, [handleMediaQuery]);

  // Cross-tab sync via BroadcastChannel
  React.useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.BroadcastChannel === 'undefined'
    ) {
      return;
    }

    const channel = new BroadcastChannel(`ssr-themes:${cookieName}`);
    broadcastRef.current = channel;

    const handleMessage = (
      event: MessageEvent<{key: string; value?: string}>,
    ) => {
      if (!event.data || event.data.key !== cookieName) {
        return;
      }

      if (!event.data.value) {
        setThemeState(defaultTheme);
        return;
      }

      setThemeState(event.data.value);
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      if (broadcastRef.current === channel) {
        broadcastRef.current = null;
      }
    };
  }, [cookieName, defaultTheme]);

  // Whenever theme or forcedTheme changes, apply it
  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme);
  }, [forcedTheme, theme]);

  const providerValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === 'system' ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      systemTheme: (enableSystem ? resolvedTheme : undefined) as
        | SystemTheme
        | undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes],
  );

  return (
    <ThemeContext.Provider value={providerValue as unknown as UseThemeProps}>
      <ThemeScript
        forcedTheme={forcedTheme}
        cookieName={cookieName}
        attribute={attribute}
        enableSystem={enableSystem}
        enableColorScheme={enableColorScheme}
        defaultTheme={defaultTheme}
        value={value}
        themes={themes}
        nonce={nonce}
        scriptProps={scriptProps}
      />

      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeScript = React.memo(
  <TThemes extends readonly string[]>({
    forcedTheme,
    cookieName,
    attribute,
    enableSystem,
    enableColorScheme,
    defaultTheme,
    value,
    themes,
    nonce,
    scriptProps,
  }: Omit<ThemeProviderProps<TThemes>, 'children' | 'cookie'> & {
    cookieName: string;
    defaultTheme: string;
  }) => {
    const scriptArgs = JSON.stringify([
      attribute,
      cookieName,
      defaultTheme,
      forcedTheme,
      themes,
      value,
      enableSystem,
      enableColorScheme,
    ]).slice(1, -1);

    return (
      <script
        {...scriptProps}
        suppressHydrationWarning
        nonce={typeof window === 'undefined' ? nonce : ''}
        dangerouslySetInnerHTML={{
          __html: `(${script.toString()})(${scriptArgs})`,
        }}
      />
    );
  },
);

// Helpers
function getThemeFromDOM<TThemes extends readonly string[]>(
  attribute: Attribute | Attribute[],
  value: Record<string, string> | undefined,
  themes: TThemes,
) {
  const attributes = Array.isArray(attribute) ? attribute : [attribute];
  const themeValues: Array<{theme: ThemeName<TThemes>; value: string}> = [];

  for (const theme of themes) {
    const themeValue = value ? value[theme] : theme;
    if (themeValue) {
      themeValues.push({theme, value: themeValue});
    }
  }

  for (const attr of attributes) {
    if (attr === 'class') {
      for (const entry of themeValues) {
        if (document.documentElement.classList.contains(entry.value)) {
          return entry.theme;
        }
      }
      continue;
    }

    const attrValue = document.documentElement.getAttribute(attr);
    if (!attrValue) continue;

    for (const entry of themeValues) {
      if (entry.value === attrValue) {
        return entry.theme;
      }
    }
  }

  return undefined;
}

function getTheme<TThemes extends readonly string[]>(
  cookieName: string,
  fallback: ThemeName<TThemes> | undefined,
  attribute: Attribute | Attribute[],
  value: Record<string, string> | undefined,
  themes: TThemes,
) {
  if (isServer) return undefined;

  const domTheme = getThemeFromDOM(attribute, value, themes);
  if (domTheme) return domTheme;

  let theme: ThemeName<TThemes> | undefined;
  try {
    theme = getCookieValue(cookieName);
  } catch (e) {
    // Unsupported
  }
  return theme || fallback;
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

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent) => {
  if (!e) {
    e = window.matchMedia(MEDIA);
  }
  const isDark = e.matches;
  const systemTheme = isDark ? 'dark' : 'light';
  return systemTheme;
};

// Re-export types
export type {
  Attribute,
  CookieConfig,
  CookieOptions,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeProviderProps,
  UseThemeProps,
  SystemTheme,
} from './types';
