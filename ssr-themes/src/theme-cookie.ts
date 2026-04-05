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

  if (value === systemCookieValueMap.dark) {
    if (themes && !themes.includes('dark' as TTheme)) {
      return undefined;
    }

    if (enableSystem === false) {
      return {
        selectedTheme: 'dark' as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: 'dark' as TTheme,
      };
    }
    return {
      selectedTheme: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      appliedTheme: 'dark' as TTheme,
    };
  }

  if (value === systemCookieValueMap.light) {
    if (
      themes &&
      !themes.includes('light' as TTheme)
    ) {
      return undefined;
    }

    if (enableSystem === false) {
      return {
        selectedTheme: 'light' as WithSystem<
          TTheme,
          TEnableSystem
        >,
        appliedTheme: 'light' as TTheme,
      };
    }
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

export const encodeTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  themeState?: ThemeState<TTheme, TEnableSystem>,
) => {
  const selectedTheme = themeState?.selectedTheme;

  if (!selectedTheme) {
    return undefined;
  }

  if (selectedTheme === 'system') {
    const resolvedTheme =
      themeState?.appliedTheme === 'dark' ||
      themeState?.appliedTheme === 'light'
        ? themeState.appliedTheme
        : undefined;

    if (!resolvedTheme) {
      return undefined;
    }

    return systemCookieValueMap[
      resolvedTheme as LightOrDark
    ];
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
  >[] = themes.map(theme => ({
    value: theme,
    selectedTheme: theme as WithSystem<
      TTheme,
      TEnableSystem
    >,
    appliedTheme: theme,
  }));

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
  resolvedTheme?: LightOrDark,
) =>
  encodeTheme<TTheme, TEnableSystem>(
    selectedTheme
      ? {
          selectedTheme,
          appliedTheme:
            selectedTheme === 'system'
              ? (resolvedTheme as TTheme | undefined)
              : (selectedTheme as TTheme),
        }
      : undefined,
  );
