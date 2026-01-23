import type {SystemTheme, ThemeName} from './types';

export const script = <TThemes extends readonly string[]>(
  attribute: any,
  cookieName: any,
  defaultTheme: ThemeName<TThemes>,
  forcedTheme: any,
  themes: TThemes,
  value: any,
  enableSystem: any,
  enableColorScheme: any,
) => {
  const el = document.documentElement;
  const attributes = Array.isArray(attribute) ? attribute : [attribute];
  const themeValues: Array<{theme: ThemeName<TThemes>; value: string}> = [];

  for (const theme of themes) {
    const themeValue = value ? value[theme] : theme;
    if (themeValue) {
      themeValues.push({theme, value: themeValue});
    }
  }
  const classList = themeValues.map(entry => entry.value);

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
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

  function updateDOM(theme: ThemeName<TThemes>) {
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
    if (enableColorScheme && (theme === 'light' || theme === 'dark')) {
      el.style.colorScheme = theme;
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

  const getThemeOrSystem = (themeName: ThemeName<TThemes>) =>
    enableSystem && themeName === 'system' ? getSystemTheme() : themeName;

  const themeName = getThemeFromDOM();
  if (themeName) {
    updateDOM(getThemeOrSystem(themeName));
    return;
  }

  try {
    const themeName = getCookie(cookieName) || defaultTheme;
    updateDOM(getThemeOrSystem(themeName));
  } catch (e) {
    //
  }
};
