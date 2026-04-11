import type {
  LightOrDark,
  ThemeOptions,
  ThemeScriptRuntimeOptions,
} from './types';

type ThemeScriptOptions = ThemeOptions<
  string,
  boolean
> &
  ThemeScriptRuntimeOptions<string>;

export default (
  attribute: NonNullable<
    ThemeOptions<string, boolean>['attribute']
  >,
  cookieName: string,
  defaultTheme: NonNullable<
    ThemeOptions<string, boolean>['defaultTheme']
  >,
  forced: ThemeScriptOptions['forced'],
  themes: NonNullable<
    ThemeOptions<string, boolean>['themes']
  >,
  valueMap: ThemeOptions<string, boolean>['valueMap'],
  enableSystem: NonNullable<
    ThemeOptions<string, boolean>['enableSystem']
  >,
  enableColorScheme: NonNullable<
    ThemeOptions<string, boolean>['enableColorScheme']
  >,
) => {
  const el = document.documentElement;
  const attributes = Array.isArray(attribute)
    ? attribute
    : [attribute];
  const themeNames = new Set(themes);
  const themeValues: Array<{
    theme: string;
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
  ): string | 'system' | undefined => {
    if (!value) {
      return undefined;
    }

    const systemTheme = value.endsWith('~d')
      ? 'dark'
      : value.endsWith('~l')
        ? 'light'
        : undefined;

    if (!systemTheme) {
      return undefined;
    }

    const selected = value.slice(0, -2);

    if (!selected) {
      if (!themeNames.has(systemTheme)) {
        return undefined;
      }

      if (!enableSystem) {
        return systemTheme;
      }

      return 'system';
    }

    if (
      selected === 'system' ||
      selected.startsWith('~')
    ) {
      return undefined;
    }

    return themeNames.has(selected)
      ? selected
      : undefined;
  };

  const getThemeFromDOM = () => {
    for (const attr of attributes) {
      if (attr === 'class') {
        for (const entry of themeValues) {
          if (el.classList.contains(entry.value)) {
            return entry.theme;
          }
        }
        continue;
      }

      const attrValue = el.getAttribute(attr);
      if (!attrValue) {
        continue;
      }

      for (const entry of themeValues) {
        if (entry.value === attrValue) {
          return entry.theme;
        }
      }
    }

    return undefined;
  };

  function updateDOM(theme: string) {
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

  if (forced) {
    updateDOM(forced);
    return;
  }

  const getThemeOrSystem = (
    themeName: string | 'system',
  ) =>
    enableSystem && themeName === 'system'
      ? getBrowserTheme()
      : themeName;

  try {
    const cookieTheme = decodeTheme(
      getCookie(cookieName),
    );
    if (cookieTheme) {
      updateDOM(getThemeOrSystem(cookieTheme));
      return;
    }

    const domTheme = getThemeFromDOM();
    if (domTheme) {
      updateDOM(domTheme);
      return;
    }

    updateDOM(getThemeOrSystem(defaultTheme));
  } catch {
    //
  }
};
