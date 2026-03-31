import type {
  LightOrDark,
  ThemeCookieState,
  ThemeOptions,
  WithSystem,
} from './types';

const systemCookieValueMap = {
  dark: '~d',
  light: '~l',
} as const;

export const decodeThemeCookieValue = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  value: string | undefined,
  themes?: ThemeOptions<
    TTheme,
    TEnableSystem
  >['themes'],
):
  | ThemeCookieState<TTheme, TEnableSystem>
  | undefined => {
  if (!value) {
    return undefined;
  }

  if (value === systemCookieValueMap.dark) {
    return {
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: 'dark' as TTheme,
    };
  }

  if (value === systemCookieValueMap.light) {
    return {
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: 'light' as TTheme,
    };
  }

  if (value.startsWith('~')) {
    return undefined;
  }

  if (
    themes &&
    value !== 'system' &&
    !themes.includes(value as TTheme)
  ) {
    return undefined;
  }

  if (value === 'system') {
    return undefined;
  }

  return {
    selectedTheme: value as WithSystem<
      TTheme,
      TEnableSystem
    >,
    appliedTheme: value as TTheme,
  };
};

export const encodeThemeCookieValue = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  selectedTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  resolvedTheme?: LightOrDark,
) => {
  if (!selectedTheme) {
    return undefined;
  }

  if (selectedTheme === 'system') {
    if (!resolvedTheme) {
      return undefined;
    }

    return systemCookieValueMap[resolvedTheme];
  }

  return selectedTheme;
};
