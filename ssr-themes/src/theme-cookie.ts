import type {
  LightOrDark,
  LightOrDarkTuple,
  ResolvedThemeState,
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

type DefaultThemeCodecOptions<
  TEnableSystem extends boolean = true,
> = ThemeCodecOptions<LightOrDark, TEnableSystem>;

type CustomThemeCodecOptions<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = Omit<
  ThemeCodecOptions<TTheme, TEnableSystem>,
  'themes'
> & {
  themes: readonly TTheme[];
};

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

export const decodeVariant = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  value: string | undefined,
  options: ThemeCodecOptions<
    TTheme,
    TEnableSystem
  > = {},
):
  | ResolvedThemeState<TTheme, TEnableSystem>
  | undefined => {
  const {
    themes,
    enableSystem = true as TEnableSystem,
  } = options;

  if (!value) {
    return undefined;
  }

  const system = parseColorSchemeToken(
    value.slice(-2),
  );

  if (!system) {
    return undefined;
  }

  const selected = value.slice(0, -2);

  if (!selected) {
    if (themes && !themes.includes(system as TTheme)) {
      return undefined;
    }

    if (enableSystem === false) {
      return {
        selected: system as WithSystem<
          TTheme,
          TEnableSystem
        >,
        resolved: system as TTheme,
        system,
      };
    }

    return {
      selected: 'system' as WithSystem<
        TTheme,
        TEnableSystem
      >,
      resolved: system as TTheme,
      system,
    };
  }

  if (
    selected === 'system' ||
    selected.startsWith('~')
  ) {
    return undefined;
  }

  if (themes && !themes.includes(selected as TTheme)) {
    return undefined;
  }

  return {
    selected: selected as WithSystem<
      TTheme,
      TEnableSystem
    >,
    resolved: selected as TTheme,
    system,
  };
};

export const encodeVariant = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  themeState?: ThemeState<TTheme, TEnableSystem>,
) => {
  const selected = themeState?.selected;
  const system =
    themeState?.system ??
    (themeState?.resolved === 'dark' ||
    themeState?.resolved === 'light'
      ? themeState.resolved
      : undefined);

  if (!selected || !system) {
    return undefined;
  }

  if (selected === 'system') {
    return systemCookieValueMap[system as LightOrDark];
  }

  return `${selected}${systemCookieValueMap[system as LightOrDark]}`;
};

export function listVariants<
  TEnableSystem extends boolean = true,
>(
  options?: DefaultThemeCodecOptions<TEnableSystem>,
): ReadonlyArray<
  ThemeVariant<LightOrDark, TEnableSystem>
>;

export function listVariants<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  options: CustomThemeCodecOptions<
    TTheme,
    TEnableSystem
  >,
): ReadonlyArray<ThemeVariant<TTheme, TEnableSystem>>;

export function listVariants(
  options: ThemeCodecOptions<string, boolean>,
): ReadonlyArray<ThemeVariant<string, boolean>>;

export function listVariants(
  options: ThemeCodecOptions<string, boolean> = {},
): ReadonlyArray<ThemeVariant<string, boolean>> {
  const themes = options.themes ?? defaultThemes;
  const variants: ThemeVariant<string, boolean>[] = [];

  for (const theme of themes) {
    variants.push({
      value: `${theme}${systemCookieValueMap.light}`,
      selected: theme,
      resolved: theme,
      system: 'light',
    });
    variants.push({
      value: `${theme}${systemCookieValueMap.dark}`,
      selected: theme,
      resolved: theme,
      system: 'dark',
    });
  }

  if (options.enableSystem === false) {
    return variants;
  }

  if (themes.includes('light')) {
    variants.push({
      value: systemCookieValueMap.light,
      selected: 'system',
      resolved: 'light',
      system: 'light',
    });
  }

  if (themes.includes('dark')) {
    variants.push({
      value: systemCookieValueMap.dark,
      selected: 'system',
      resolved: 'dark',
      system: 'dark',
    });
  }

  return variants;
}

export const decodeThemeCookieValue = decodeVariant;
export const encodeThemeCookieValue = <
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  selected:
    | WithSystem<TTheme, TEnableSystem>
    | undefined,
  system?: LightOrDark,
) =>
  encodeVariant<TTheme, TEnableSystem>(
    selected
      ? {
          selected,
          resolved:
            selected === 'system'
              ? (system as TTheme | undefined)
              : (selected as TTheme),
          system,
        }
      : undefined,
  );
