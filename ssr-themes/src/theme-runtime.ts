import type {
  CookieOptions,
  LightOrDark,
  LightOrDarkTuple,
  ThemeState,
  ThemeOptions,
  WithSystem,
} from './types';
import {
  decodeThemeCookieValue,
  encodeThemeCookieValue,
} from './theme-cookie';

export type ThemeBroadcastMessage = {
  key: string;
  value?: string | undefined;
};

type SystemThemeListener = (
  event: MediaQueryList | MediaQueryListEvent,
) => void;

type ThemeBroadcastListener = (
  value: string | undefined,
) => void;

export type ThemeBroadcastSubscription = {
  channel: BroadcastChannel | null;
  cleanup: () => void;
};

export const themeMedia =
  '(prefers-color-scheme: dark)';

export const defaultThemes = [
  'dark',
  'light',
] as const satisfies LightOrDarkTuple;

export const defaultCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 31536000,
  sameSite: 'lax',
};

export const getCookieName = (
  cookie?: CookieOptions,
) => cookie?.name ?? 'theme';

export const getCookieValue = (key: string) => {
  if (typeof document === 'undefined') {
    return undefined;
  }

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

export const formatSameSite = (
  sameSite?: CookieOptions['sameSite'],
) => {
  if (!sameSite) return undefined;

  return `${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`;
};

export const saveToCookie = (
  cookieName: string,
  themeState: ThemeState<string, boolean>,
  options?: CookieOptions,
) => {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    const cookieValue = encodeThemeCookieValue(
      themeState.selectedTheme,
      themeState.colorScheme,
    );
    if (!cookieValue) {
      return;
    }

    const cookieOptions = {
      ...defaultCookieOptions,
      ...(options ?? {}),
    };
    const parts = [
      `${cookieName}=${encodeURIComponent(cookieValue)}`,
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

export const resolveDefaultTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  defaultTheme: ThemeOptions<
    TTheme,
    TEnableSystem
  >['defaultTheme'],
  enableSystem?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['enableSystem'],
) =>
  (defaultTheme ??
    ((enableSystem ?? true)
      ? 'system'
      : 'light')) as WithSystem<TTheme, TEnableSystem>;

export const getSystemTheme = (
  media?: MediaQueryList | MediaQueryListEvent,
): LightOrDark => {
  const event = media ?? window.matchMedia(themeMedia);

  return event.matches ? 'dark' : 'light';
};

export const getTheme = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  cookieName: string,
  fallback:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  selectedTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  themes?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['themes'],
  enableSystem?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['enableSystem'],
) => {
  if (typeof window === 'undefined') {
    if (
      selectedTheme === 'system' &&
      enableSystem === false
    ) {
      return fallback;
    }
    return selectedTheme;
  }

  if (selectedTheme) {
    if (
      selectedTheme === 'system' &&
      enableSystem === false
    ) {
      return fallback;
    }
    return selectedTheme;
  }

  let theme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;

  try {
    theme = decodeThemeCookieValue<
      TTheme,
      TEnableSystem
    >(getCookieValue(cookieName), {
      enableSystem,
      themes,
    })?.selectedTheme;
  } catch {}

  if (theme) {
    return theme;
  }

  return fallback;
};

export const createThemeBroadcastChannelName = (
  cookieName: string,
) => `ssr-themes:${cookieName}`;

export const isThemeBroadcastMessage = (
  data: unknown,
  cookieName: string,
): data is ThemeBroadcastMessage => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const {key, value} = data as {
    key?: unknown;
    value?: unknown;
  };

  return (
    key === cookieName &&
    (typeof value === 'string' ||
      typeof value === 'undefined')
  );
};

export const postThemeBroadcast = (
  channel: BroadcastChannel | null | undefined,
  cookieName: string,
  value: string,
) => {
  const message: ThemeBroadcastMessage = {
    key: cookieName,
    value,
  };

  channel?.postMessage(message);
};

export const subscribeToSystemTheme = (
  listener: SystemThemeListener,
  emitInitial = true,
) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const media = window.matchMedia(themeMedia);

  if (typeof media.addListener === 'function') {
    const handleLegacyChange = (
      event: MediaQueryListEvent,
    ) => {
      listener(event);
    };

    media.addListener(handleLegacyChange);
    if (emitInitial) {
      listener(media);
    }

    return () => {
      media.removeListener(handleLegacyChange);
    };
  }

  const handleChange = (
    event: MediaQueryListEvent,
  ) => {
    listener(event);
  };

  media.addEventListener('change', handleChange);
  if (emitInitial) {
    listener(media);
  }

  return () => {
    media.removeEventListener('change', handleChange);
  };
};

export const createThemeBroadcastSubscription = (
  cookieName: string,
  onValue: ThemeBroadcastListener,
): ThemeBroadcastSubscription => {
  if (
    typeof window === 'undefined' ||
    typeof window.BroadcastChannel === 'undefined'
  ) {
    return {
      channel: null,
      cleanup: () => {},
    };
  }

  const channel = new BroadcastChannel(
    createThemeBroadcastChannelName(cookieName),
  );
  const handleMessage = (
    event: MessageEvent<ThemeBroadcastMessage>,
  ) => {
    if (
      !isThemeBroadcastMessage(event.data, cookieName)
    ) {
      return;
    }

    onValue(event.data.value);
  };

  channel.addEventListener('message', handleMessage);

  return {
    channel,
    cleanup: () => {
      channel.removeEventListener(
        'message',
        handleMessage,
      );
      channel.close();
    },
  };
};
