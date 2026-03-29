import type {
  LightOrDark,
  LightOrDarkTuple,
  ThemeOptions,
} from './core-types.js';

const script = <
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
  const root = document.documentElement;
  const attributes = Array.isArray(attribute)
    ? attribute
    : [attribute];
  const themeValues: Array<{
    theme: TTheme;
    value: string;
  }> = [];

  for (const theme of themes) {
    const value = valueMap ? valueMap[theme] : theme;
    if (value) {
      themeValues.push({theme, value});
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

  const getThemeFromDom = () => {
    for (const attribute of attributes) {
      if (attribute === 'class') {
        for (const entry of themeValues) {
          if (root.classList.contains(entry.value)) {
            return entry.theme;
          }
        }

        continue;
      }

      const attributeValue =
        root.getAttribute(attribute);
      if (!attributeValue) continue;

      for (const entry of themeValues) {
        if (entry.value === attributeValue) {
          return entry.theme;
        }
      }
    }

    return undefined;
  };

  function updateDom(theme: TTheme) {
    const value = valueMap ? valueMap[theme] : theme;

    for (const attribute of attributes) {
      if (attribute === 'class') {
        root.classList.remove(...classList);
        if (value) {
          root.classList.add(value);
        }
      } else if (value) {
        root.setAttribute(attribute, value);
      } else {
        root.removeAttribute(attribute);
      }
    }

    if (!enableColorScheme) return;

    if (theme === 'light' || theme === 'dark') {
      root.style.colorScheme = theme;
      return;
    }

    root.style.colorScheme = '';
  }

  const getBrowserTheme = (): LightOrDark =>
    window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';

  if (forcedTheme) {
    updateDom(forcedTheme);
    return;
  }

  const resolveTheme = (theme: string) =>
    enableSystem && theme === 'system'
      ? (getBrowserTheme() as TTheme)
      : (theme as TTheme);

  const themeFromDom = getThemeFromDom();
  if (themeFromDom) {
    updateDom(resolveTheme(themeFromDom));
    return;
  }

  try {
    updateDom(
      resolveTheme(
        getCookie(cookieName) || defaultTheme,
      ),
    );
  } catch {}
};

export const svelteThemeScript = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  options: ThemeOptions<TTheme, TEnableSystem> = {},
) => {
  const {
    attribute = 'class',
    cookie,
    defaultTheme,
    enableColorScheme = true,
    forcedTheme,
    themes = [
      'dark',
      'light',
    ] as const satisfies LightOrDarkTuple,
    valueMap,
    enableSystem,
  } = options;

  const enableSystemValue = enableSystem ?? true;
  const resolvedDefaultTheme =
    defaultTheme ??
    (enableSystemValue ? 'system' : 'light');
  const cookieName = cookie?.name ?? 'theme';
  const scriptArgs = JSON.stringify([
    attribute,
    cookieName,
    resolvedDefaultTheme,
    forcedTheme,
    themes,
    valueMap,
    enableSystemValue,
    enableColorScheme,
  ]).slice(1, -1);

  return `(${script.toString()})(${scriptArgs})`;
};
