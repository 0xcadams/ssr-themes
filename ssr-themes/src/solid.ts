import {
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  untrack,
  useContext,
} from 'solid-js';
import {isServer} from 'solid-js/web';
import {ThemeContext} from './solid-context';
import type {
  ThemeContextValue,
  ThemeProviderProps,
  ThemeResult,
  ThemeSetter,
} from './solid-types';
import type {
  CookieOptions,
  LightOrDark,
  LightOrDarkTuple,
  WithSystem,
} from './types';

const colorSchemes = ['light', 'dark'];
const MEDIA = '(prefers-color-scheme: dark)';
const defaultCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax',
};
const defaultThemes = [
  'dark',
  'light',
] as const satisfies LightOrDarkTuple;

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
  } catch {}
};

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
    (() => window.getComputedStyle(document.body))();

    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
};

const getBaseTheme = (
  media?: MediaQueryList | MediaQueryListEvent,
): LightOrDark => {
  const event = media ?? window.matchMedia(MEDIA);
  return event.matches ? 'dark' : 'light';
};

const getTheme = <
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
) => {
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
  } catch {}
  if (theme) return theme;

  return fallback;
};

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
  const resolvedDefaultTheme = createMemo(
    () =>
      (props.defaultTheme ??
        (enableSystemValue()
          ? 'system'
          : 'light')) as WithSystem<
        TTheme,
        TEnableSystem
      >,
  );
  const cookieName = getCookieName(props.cookie);
  const [theme, setThemeState] = createSignal<
    WithSystem<TTheme, TEnableSystem> | undefined
  >(
    getTheme(
      cookieName,
      resolvedDefaultTheme(),
      props.initialTheme,
    ),
  );
  const [systemTheme, setSystemTheme] = createSignal<
    Exclude<TTheme, 'system'> | undefined
  >(
    theme() === 'system' && !isServer
      ? (getBaseTheme() as Exclude<TTheme, 'system'>)
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
      resolved = getBaseTheme() as TTheme;
    }

    const nextTheme = resolved as TTheme;
    const nextName = props.valueMap
      ? props.valueMap[nextTheme]
      : nextTheme;
    const restoreTransitions =
      (props.disableTransitionOnChange ?? true)
        ? disableAnimation(props.nonce)
        : null;
    const element = document.documentElement;
    const attributes = Array.isArray(props.attribute)
      ? props.attribute
      : [props.attribute ?? 'class'];

    for (const attribute of attributes) {
      if (attribute === 'class') {
        element.classList.remove(...themeValues());
        if (nextName) {
          element.classList.add(nextName);
        }
      } else if (nextName) {
        element.setAttribute(attribute, nextName);
      } else {
        element.removeAttribute(attribute);
      }
    }

    if (props.enableColorScheme ?? true) {
      element.style.colorScheme =
        colorSchemes.includes(nextTheme)
          ? nextTheme
          : '';
    }

    restoreTransitions?.();
    return resolved;
  };

  const broadcastTheme = (value: string) => {
    broadcastChannel?.postMessage({
      key: cookieName,
      value,
    });
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
    const media = window.matchMedia(MEDIA);
    const handleMediaQuery = (
      event: MediaQueryList | MediaQueryListEvent,
    ) => {
      const nextTheme = getBaseTheme(event) as Exclude<
        TTheme,
        'system'
      >;
      setSystemTheme(() => nextTheme);

      if (
        theme() === 'system' &&
        enableSystemValue() &&
        !props.forcedTheme
      ) {
        applyTheme(
          'system' as WithSystem<
            TTheme,
            TEnableSystem
          >,
        );
      }
    };

    if ('addEventListener' in media) {
      media.addEventListener(
        'change',
        handleMediaQuery,
      );
      onCleanup(() => {
        media.removeEventListener(
          'change',
          handleMediaQuery,
        );
      });
    } else {
      const legacyMedia = media as MediaQueryList & {
        addListener: (
          listener: typeof handleMediaQuery,
        ) => void;
        removeListener: (
          listener: typeof handleMediaQuery,
        ) => void;
      };
      legacyMedia.addListener(handleMediaQuery);
      onCleanup(() => {
        legacyMedia.removeListener(handleMediaQuery);
      });
    }

    handleMediaQuery(media);
  });

  onMount(() => {
    if (
      typeof window.BroadcastChannel === 'undefined'
    ) {
      return;
    }

    const channel = new BroadcastChannel(
      `ssr-themes:${cookieName}`,
    );
    broadcastChannel = channel;

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
        setThemeState(() => resolvedDefaultTheme());
        return;
      }

      setThemeState(
        () =>
          event.data.value as
            | WithSystem<TTheme, TEnableSystem>
            | undefined,
      );
    };

    channel.addEventListener('message', handleMessage);

    onCleanup(() => {
      channel.removeEventListener(
        'message',
        handleMessage,
      );
      channel.close();
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
  ThemeProviderProps,
  ThemeResult,
  ThemeSetter,
} from './solid-types';
export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeOptions,
  WithSystem,
} from './types';
