import type {
  LightOrDark,
  WithSystem,
  ThemeOptions,
} from './types';

export const script = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  attribute: NonNullable<
    ThemeOptions<TTheme, TEnableSystem>['attribute']
  >,
  cookieName: string,
  defaultTheme: NonNullable<
    ThemeOptions<TTheme, TEnableSystem>['defaultTheme']
  >,
  forcedTheme: ThemeOptions<
    TTheme,
    TEnableSystem
  >['forcedTheme'],
  themes: NonNullable<
    ThemeOptions<TTheme, TEnableSystem>['themes']
  >,
  valueMap: ThemeOptions<
    TTheme,
    TEnableSystem
  >['valueMap'],
  enableSystem: NonNullable<
    ThemeOptions<TTheme, TEnableSystem>['enableSystem']
  >,
  enableColorScheme: NonNullable<
    ThemeOptions<
      TTheme,
      TEnableSystem
    >['enableColorScheme']
  >,
) => {
  const el = document.documentElement;
  const attributes = Array.isArray(attribute)
    ? attribute
    : [attribute];
  const themeNames = new Set(themes);
  const themeValues: Array<{
    theme: TTheme;
    value: string;
  }> = [];

  for (const theme of themes) {
    const themeValue = valueMap
      ? valueMap[theme]
      : theme;
    if (themeValue) {
      themeValues.push({theme, value: themeValue});
    }
  }
  const classList = themeValues.map(
    entry => entry.value,
  );

  const getCookie = (name: string) => {
    const cookies = document.cookie
      ? document.cookie.split('; ')
      : [];
    for (const cookie of cookies) {
      const [cookieName, ...rest] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return undefined;
  };

  const decodeTheme = (
    value: string | undefined,
  ): WithSystem<TTheme, TEnableSystem> | undefined => {
    if (!value) {
      return undefined;
    }

    if (value === '~d' || value === '~l') {
      return 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >;
    }

    if (value === 'system') {
      return 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >;
    }

    if (value.startsWith('~')) {
      return undefined;
    }

    return themeNames.has(value as TTheme)
      ? (value as WithSystem<TTheme, TEnableSystem>)
      : undefined;
  };

  function updateDOM(theme: TTheme) {
    const name = valueMap ? valueMap[theme] : theme;
    for (const attr of attributes) {
      if (attr === 'class') {
        el.classList.remove(...classList);
        if (name) {
          el.classList.add(name);
        }
      } else {
        if (name) {
          el.setAttribute(attr, name);
        } else {
          el.removeAttribute(attr);
        }
      }
    }
    if (enableColorScheme) {
      if (theme === 'light' || theme === 'dark') {
        el.style.colorScheme = theme;
      } else {
        el.style.colorScheme = '';
      }
    }
  }

  const getBrowserTheme = (): LightOrDark =>
    window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';

  if (forcedTheme) {
    updateDOM(forcedTheme);
    return;
  }

  const getThemeOrSystem = (
    themeName: WithSystem<TTheme, TEnableSystem>,
  ) =>
    enableSystem && themeName === 'system'
      ? (getBrowserTheme() as TTheme)
      : (themeName as TTheme);

  try {
    const themeName =
      decodeTheme(getCookie(cookieName)) ??
      (defaultTheme as WithSystem<
        TTheme,
        TEnableSystem
      >);
    updateDOM(getThemeOrSystem(themeName));
  } catch {
    //
  }
};
