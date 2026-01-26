import type {SystemTheme, ThemeName, ThemeOptions} from './types';

type ScriptOptions<
  TTheme extends string,
  TEnableSystem extends boolean,
> = ThemeOptions<TTheme, TEnableSystem>;

export const script = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  attribute: NonNullable<ScriptOptions<TTheme, TEnableSystem>['attribute']>,
  cookieName: string,
  defaultTheme: NonNullable<
    ScriptOptions<TTheme, TEnableSystem>['defaultTheme']
  >,
  forcedTheme: ScriptOptions<TTheme, TEnableSystem>['forcedTheme'],
  themes: NonNullable<ScriptOptions<TTheme, TEnableSystem>['themes']>,
  value: ScriptOptions<TTheme, TEnableSystem>['value'],
  enableSystem: NonNullable<
    ScriptOptions<TTheme, TEnableSystem>['enableSystem']
  >,
  enableColorScheme: NonNullable<
    ScriptOptions<TTheme, TEnableSystem>['enableColorScheme']
  >,
) => {
  const el = document.documentElement;
  const attributes = Array.isArray(attribute) ? attribute : [attribute];
  const themeValues: Array<{theme: TTheme; value: string}> = [];

  for (const theme of themes) {
    const themeValue = value ? value[theme] : theme;
    if (themeValue) {
      themeValues.push({theme, value: themeValue});
    }
  }
  const classList = themeValues.map(entry => entry.value);

  const getCookie = (name: string) => {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [cookieName, ...rest] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return undefined;
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
      if (!attrValue) continue;

      for (const entry of themeValues) {
        if (entry.value === attrValue) {
          return entry.theme;
        }
      }
    }

    return undefined;
  };

  function updateDOM(theme: TTheme) {
    const name = value ? value[theme] : theme;
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

  const getSystemTheme = (): SystemTheme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  if (forcedTheme) {
    updateDOM(forcedTheme);
    return;
  }

  const getThemeOrSystem = (themeName: ThemeName<TTheme, TEnableSystem>) =>
    enableSystem && themeName === 'system'
      ? (getSystemTheme() as TTheme)
      : (themeName as TTheme);

  const themeName = getThemeFromDOM();
  if (themeName) {
    updateDOM(getThemeOrSystem(themeName));
    return;
  }

  try {
    const themeName = (getCookie(cookieName) || defaultTheme) as ThemeName<
      TTheme,
      TEnableSystem
    >;
    updateDOM(getThemeOrSystem(themeName));
  } catch (e) {
    //
  }
};
