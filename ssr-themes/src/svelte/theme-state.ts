import {readonly, writable} from 'svelte/store';

import type {
  Attribute,
  CookieOptions,
  LightOrDark,
  LightOrDarkTuple,
  WithSystem,
} from './core-types.js';
import type {
  ThemeContext,
  ThemeProviderProps,
  SetThemeValue,
} from './types.js';

const colorSchemes = ['light', 'dark'];
const defaultCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax',
};
const defaultThemes = [
  'dark',
  'light',
] as const satisfies LightOrDarkTuple;
const MEDIA = '(prefers-color-scheme: dark)';
const isServer = typeof window === 'undefined';

type ThemeControllerOptions<
  TTheme extends string,
  TEnableSystem extends boolean,
> = ThemeProviderProps<TTheme, TEnableSystem> & {
  cookieName: string;
  enableSystemValue: TEnableSystem;
  publicThemes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  resolvedDefaultTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  themes: readonly TTheme[];
  attrs: readonly string[];
};

type ThemeController<
  TTheme extends string,
  TEnableSystem extends boolean,
> = {
  context: ThemeContext<TTheme, TEnableSystem>;
  start: () => void;
  update: (
    nextOptions: ThemeProviderProps<
      TTheme,
      TEnableSystem
    >,
  ) => void;
  destroy: () => void;
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
    const parts = [
      `${cookieName}=${encodeURIComponent(value)}`,
    ];

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

const getStoredTheme = <
  TTheme extends string,
  TEnableSystem extends boolean,
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

  try {
    const theme = getCookieValue(cookieName) as
      | WithSystem<TTheme, TEnableSystem>
      | undefined;
    if (theme) return theme;
  } catch {}

  return fallback;
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
    window.getComputedStyle(document.body);

    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
};

const getBaseTheme = (
  media?: MediaQueryList | MediaQueryListEvent,
): LightOrDark => {
  const query = media ?? window.matchMedia(MEDIA);
  return query.matches ? 'dark' : 'light';
};

const applyThemeToDocument = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  options: ThemeControllerOptions<
    TTheme,
    TEnableSystem
  >,
  theme: WithSystem<TTheme, TEnableSystem> | undefined,
) => {
  if (!theme) return undefined;

  let resolved = theme;
  if (
    resolved === 'system' &&
    options.enableSystemValue
  ) {
    resolved = getBaseTheme() as TTheme;
  }

  const resolvedTheme = resolved as TTheme;
  const name = options.valueMap
    ? options.valueMap[resolvedTheme]
    : resolvedTheme;
  const enable = options.disableTransitionOnChange
    ? disableAnimation(options.nonce)
    : null;
  const root = document.documentElement;

  const applyAttribute = (attribute: Attribute) => {
    if (attribute === 'class') {
      root.classList.remove(...options.attrs);
      if (name) root.classList.add(name);
      return;
    }

    if (name) {
      root.setAttribute(attribute, name);
    } else {
      root.removeAttribute(attribute);
    }
  };

  const attribute = options.attribute;
  if (Array.isArray(attribute)) {
    attribute.forEach(applyAttribute);
  } else {
    applyAttribute(attribute as Attribute);
  }

  if (options.enableColorScheme) {
    root.style.colorScheme = colorSchemes.includes(
      resolvedTheme,
    )
      ? resolvedTheme
      : '';
  }

  enable?.();
  return resolved;
};

const subscribeToMedia = (
  media: MediaQueryList,
  callback: (
    event: MediaQueryList | MediaQueryListEvent,
  ) => void,
) => {
  if ('addEventListener' in media) {
    const listener = (event: MediaQueryListEvent) => {
      callback(event);
    };
    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }

  const legacyMedia = media as MediaQueryList & {
    addListener: (
      listener: (
        event: MediaQueryList | MediaQueryListEvent,
      ) => void,
    ) => void;
    removeListener: (
      listener: (
        event: MediaQueryList | MediaQueryListEvent,
      ) => void,
    ) => void;
  };
  legacyMedia.addListener(callback);
  return () => {
    legacyMedia.removeListener(callback);
  };
};

const normalizeOptions = <
  TTheme extends string,
  TEnableSystem extends boolean,
>(
  options: ThemeProviderProps<TTheme, TEnableSystem>,
): ThemeControllerOptions<TTheme, TEnableSystem> => {
  const themes =
    options.themes ??
    (defaultThemes as unknown as readonly TTheme[]);
  const enableSystemValue = (options.enableSystem ??
    true) as TEnableSystem;
  const attribute = options.attribute ?? 'class';
  const enableColorScheme =
    options.enableColorScheme ?? true;
  const resolvedDefaultTheme =
    options.defaultTheme ??
    ((enableSystemValue
      ? 'system'
      : 'light') as WithSystem<TTheme, TEnableSystem>);

  return {
    ...options,
    attribute,
    enableColorScheme,
    themes,
    enableSystemValue,
    cookieName: getCookieName(options.cookie),
    publicThemes: (enableSystemValue
      ? [...themes, 'system']
      : themes) as ReadonlyArray<
      WithSystem<TTheme, TEnableSystem>
    >,
    resolvedDefaultTheme,
    attrs: (!options.valueMap
      ? themes
      : Object.values(
          options.valueMap,
        )) as readonly string[],
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
  let baseTheme = !isServer
    ? getBaseTheme()
    : undefined;
  let theme = getStoredTheme(
    options.cookieName,
    options.resolvedDefaultTheme,
    options.initialTheme,
  );

  const themeStore = writable<
    WithSystem<TTheme, TEnableSystem> | undefined
  >(theme);
  const forcedThemeStore = writable<
    TTheme | undefined
  >(options.forcedTheme);
  const themesStore = writable(options.publicThemes);
  const resolvedThemeStore = writable<
    Exclude<TTheme, 'system'> | undefined
  >();
  const colorSchemeStore =
    writable<
      TEnableSystem extends true
        ? LightOrDark | undefined
        : undefined
    >();

  let broadcastChannel: BroadcastChannel | null = null;
  let stopMediaSubscription: (() => void) | null =
    null;

  const updateDerivedStores = () => {
    const appliedTheme = options.forcedTheme ?? theme;
    const resolved =
      appliedTheme === 'system' &&
      options.enableSystemValue
        ? (baseTheme as
            | Exclude<TTheme, 'system'>
            | undefined)
        : (appliedTheme as
            | Exclude<TTheme, 'system'>
            | undefined);

    resolvedThemeStore.set(resolved);
    colorSchemeStore.set(
      (options.enableSystemValue
        ? baseTheme
        : undefined) as TEnableSystem extends true
        ? LightOrDark | undefined
        : undefined,
    );
  };

  const applyTheme = () => {
    if (isServer) return;

    applyThemeToDocument(
      options,
      options.forcedTheme ?? theme,
    );
    updateDerivedStores();
  };

  const closeBroadcastChannel = () => {
    broadcastChannel?.close();
    broadcastChannel = null;
  };

  const openBroadcastChannel = () => {
    closeBroadcastChannel();

    if (
      isServer ||
      typeof window.BroadcastChannel === 'undefined'
    ) {
      return;
    }

    const channel = new BroadcastChannel(
      `ssr-themes:${options.cookieName}`,
    );
    channel.addEventListener('message', event => {
      const data = event.data as
        | {key?: string; value?: string}
        | undefined;
      if (!data || data.key !== options.cookieName) {
        return;
      }

      theme = (data.value ??
        options.resolvedDefaultTheme) as
        | WithSystem<TTheme, TEnableSystem>
        | undefined;
      themeStore.set(theme);
      applyTheme();
    });
    broadcastChannel = channel;
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

    if (!isServer) {
      saveToCookie(
        options.cookieName,
        nextTheme,
        options.cookie,
      );
      broadcastChannel?.postMessage({
        key: options.cookieName,
        value: nextTheme,
      });
      applyTheme();
      return;
    }

    updateDerivedStores();
  };

  const start = () => {
    if (isServer) {
      updateDerivedStores();
      return;
    }

    const media = window.matchMedia(MEDIA);
    stopMediaSubscription = subscribeToMedia(
      media,
      event => {
        baseTheme = getBaseTheme(event);
        updateDerivedStores();

        if (
          theme === 'system' &&
          options.enableSystemValue &&
          !options.forcedTheme
        ) {
          applyTheme();
        }
      },
    );
    baseTheme = getBaseTheme(media);
    openBroadcastChannel();
    applyTheme();
  };

  const update = (
    nextOptions: ThemeProviderProps<
      TTheme,
      TEnableSystem
    >,
  ) => {
    const previousCookieName = options.cookieName;
    options = normalizeOptions(nextOptions);

    forcedThemeStore.set(options.forcedTheme);
    themesStore.set(options.publicThemes);

    if (
      theme === undefined &&
      options.initialTheme !== undefined
    ) {
      theme = options.initialTheme;
      themeStore.set(theme);
    }

    if (
      !isServer &&
      previousCookieName !== options.cookieName
    ) {
      openBroadcastChannel();
    }

    if (!isServer) {
      applyTheme();
      return;
    }

    updateDerivedStores();
  };

  const destroy = () => {
    stopMediaSubscription?.();
    closeBroadcastChannel();
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
    start,
    update,
    destroy,
  };
};
