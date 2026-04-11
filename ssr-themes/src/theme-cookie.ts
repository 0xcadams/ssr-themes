import type {
  LightOrDark,
  LightOrDarkTuple,
  ThemeCookieState,
  ThemeOptions,
  ThemeState,
  ThemeVariant,
  WithSystem,
} from './types';

type ThemeCodecOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = Pick<
  ThemeOptions<TTheme, TEnableSystem>,
  'themes' | 'enableSystem'
>;

const defaultThemes = [
  'dark',
  'light',
] as const satisfies LightOrDarkTuple;

const systemCookieValueMap = {
  dark: '~d',
  light: '~l',
} as const;

const parseColorSchemeToken = (
  value: string | undefined,
): LightOrDark | undefined => {
  if (value === '~d') {
    return 'dark';
  }

  if (value === '~l') {
    return 'light';
  }

  return undefined;
};

const parseExplicitThemeToken = (
  value: string,
):
  | {
      colorScheme: LightOrDark;
      theme: string;
    }
  | undefined => {
  const suffix = parseColorSchemeToken(
    value.slice(-2),
  );

  if (!suffix) {
    return undefined;
  }

  const theme = value.slice(0, -2);

  if (!theme) {
    return undefined;
  }

  return {
    colorScheme: suffix,
    theme,
  };
};

export const decodeTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  value: string | undefined,
  options: ThemeCodecOptions<
    TTheme,
    TEnableSystem
  > = {},
):
  | ThemeCookieState<TTheme, TEnableSystem>
  | undefined => {
  const {
    themes,
    enableSystem = true as TEnableSystem,
  } = options;

  if (!value) {
    return undefined;
  }

  const compactTheme = parseColorSchemeToken(value);

  if (compactTheme) {
    if (
      themes &&
      !themes.includes(compactTheme as TTheme)
    ) {
      return undefined;
    }

    if (enableSystem === false) {
      return {
        selectedTheme: compactTheme as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: compactTheme as TTheme,
        colorScheme: compactTheme,
      };
    }

    return {
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: compactTheme as TTheme,
      colorScheme: compactTheme,
    };
  }

  const explicitTheme = parseExplicitThemeToken(value);

  if (explicitTheme) {
    if (
      themes &&
      !themes.includes(explicitTheme.theme as TTheme)
    ) {
      return undefined;
    }

    return {
      selectedTheme: explicitTheme.theme as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: explicitTheme.theme as TTheme,
      colorScheme: explicitTheme.colorScheme,
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

export const encodeTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  themeState?: ThemeState<TTheme, TEnableSystem>,
) => {
  const selectedTheme = themeState?.selectedTheme;
  const colorScheme = themeState?.colorScheme;

  if (!selectedTheme) {
    return undefined;
  }

  if (selectedTheme === 'system') {
    const resolvedTheme =
      colorScheme ??
      (themeState?.appliedTheme === 'dark' ||
      themeState?.appliedTheme === 'light'
        ? themeState.appliedTheme
        : undefined);

    if (!resolvedTheme) {
      return undefined;
    }

    return systemCookieValueMap[
      resolvedTheme as LightOrDark
    ];
  }

  if (colorScheme) {
    return `${selectedTheme}${systemCookieValueMap[colorScheme]}`;
  }

  return selectedTheme;
};

export const themeVariants = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  options: ThemeCodecOptions<
    TTheme,
    TEnableSystem
  > = {},
): ReadonlyArray<
  ThemeVariant<TTheme, TEnableSystem>
> => {
  const themes = (options.themes ??
    defaultThemes) as readonly TTheme[];
  const variants: ThemeVariant<
    TTheme,
    TEnableSystem
  >[] = [];

  if (options.enableSystem !== false) {
    for (const theme of themes) {
      variants.push({
        value: `${theme}${systemCookieValueMap.light}`,
        selectedTheme: theme as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: theme,
        colorScheme: 'light',
      });
      variants.push({
        value: `${theme}${systemCookieValueMap.dark}`,
        selectedTheme: theme as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: theme,
        colorScheme: 'dark',
      });
    }
  } else {
    for (const theme of themes) {
      variants.push({
        value: theme,
        selectedTheme: theme as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: theme,
      });
    }
  }

  if (options.enableSystem === false) {
    return variants;
  }

  if (themes.includes('light' as TTheme)) {
    variants.push({
      value: systemCookieValueMap.light,
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: 'light' as TTheme,
      colorScheme: 'light',
    });
  }

  if (themes.includes('dark' as TTheme)) {
    variants.push({
      value: systemCookieValueMap.dark,
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: 'dark' as TTheme,
      colorScheme: 'dark',
    });
  }

  return variants;
};

export const decodeThemeCookieValue = decodeTheme;
export const encodeThemeCookieValue = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  selectedTheme:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  colorScheme?: LightOrDark,
) =>
  encodeTheme<TTheme, TEnableSystem>(
    selectedTheme
      ? {
          selectedTheme,
          appliedTheme:
            selectedTheme === 'system'
              ? (colorScheme as TTheme | undefined)
              : (selectedTheme as TTheme),
          colorScheme,
        }
      : undefined,
  );
