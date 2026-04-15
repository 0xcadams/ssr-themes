import type {
  AnyThemeOptions,
  EnableSystemFromOptions,
  HumanReadable,
  LightOrDark,
  LightOrDarkTuple,
  ResolvedThemeState,
  ThemeNameFromOptions,
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

type AnyThemeCodecOptions = Pick<
  AnyThemeOptions,
  'themes' | 'enableSystem'
>;

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

export function decodeVariant(
  value: string | undefined,
):
  | HumanReadable<
      ResolvedThemeState<LightOrDark, true>
    >
  | undefined;

export function decodeVariant<
  TEnableSystem extends boolean = true,
>(
  value: string | undefined,
  options?: DefaultThemeCodecOptions<TEnableSystem>,
):
  | HumanReadable<
      ResolvedThemeState<LightOrDark, TEnableSystem>
    >
  | undefined;

export function decodeVariant<
  const TOptions extends CustomThemeCodecOptions<
    string,
    boolean
  >,
>(
  value: string | undefined,
  options: TOptions,
):
  | HumanReadable<
      ResolvedThemeState<
        ThemeNameFromOptions<TOptions>,
        EnableSystemFromOptions<TOptions>
      >
    >
  | undefined;

export function decodeVariant<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  value: string | undefined,
  options: ThemeCodecOptions<TTheme, TEnableSystem>,
):
  | HumanReadable<
      ResolvedThemeState<TTheme, TEnableSystem>
    >
  | undefined;

export function decodeVariant(
  value: string | undefined,
  options: AnyThemeCodecOptions,
):
  | HumanReadable<ResolvedThemeState<string, boolean>>
  | undefined;

export function decodeVariant(
  value: string | undefined,
  options: AnyThemeCodecOptions = {},
):
  | HumanReadable<ResolvedThemeState<string, boolean>>
  | undefined {
  const themeNames = options.themes ?? defaultThemes;
  const enableSystem = options.enableSystem ?? true;

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
    if (!themeNames.includes(system)) {
      return undefined;
    }

    if (enableSystem === false) {
      return {
        selected: system,
        resolved: system,
        system,
      };
    }

    return {
      selected: 'system',
      resolved: system,
      system,
    };
  }

  if (
    selected === 'system' ||
    selected.startsWith('~')
  ) {
    return undefined;
  }

  if (!themeNames.includes(selected)) {
    return undefined;
  }

  return {
    selected,
    resolved: selected,
    system,
  };
}

export const encodeVariant = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  themeState?: ThemeState<TTheme, TEnableSystem>,
) => {
  const selected = themeState?.selected;
  let system = themeState?.system;

  if (!system && themeState?.resolved === 'dark') {
    system = 'dark';
  } else if (
    !system &&
    themeState?.resolved === 'light'
  ) {
    system = 'light';
  }

  if (!selected || !system) {
    return undefined;
  }

  if (selected === 'system') {
    return systemCookieValueMap[system];
  }

  return `${selected}${systemCookieValueMap[system]}`;
};

export function listVariants(): ReadonlyArray<
  HumanReadable<ThemeVariant<LightOrDark, true>>
>;

export function listVariants<
  TEnableSystem extends boolean = true,
>(
  options?: DefaultThemeCodecOptions<TEnableSystem>,
): ReadonlyArray<
  HumanReadable<
    ThemeVariant<LightOrDark, TEnableSystem>
  >
>;

export function listVariants<
  const TOptions extends CustomThemeCodecOptions<
    string,
    boolean
  >,
>(
  options: TOptions,
): ReadonlyArray<
  HumanReadable<
    ThemeVariant<
      ThemeNameFromOptions<TOptions>,
      EnableSystemFromOptions<TOptions>
    >
  >
>;

export function listVariants<
  TTheme extends string,
  TEnableSystem extends boolean = true,
>(
  options: ThemeCodecOptions<TTheme, TEnableSystem>,
): ReadonlyArray<
  HumanReadable<ThemeVariant<TTheme, TEnableSystem>>
>;

export function listVariants(
  options: AnyThemeCodecOptions,
): ReadonlyArray<
  HumanReadable<ThemeVariant<string, boolean>>
>;

export function listVariants(
  options: AnyThemeCodecOptions = {},
): ReadonlyArray<
  HumanReadable<ThemeVariant<string, boolean>>
> {
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
export const encodeThemeCookieValue = (
  selected: WithSystem<string, boolean> | undefined,
  system?: LightOrDark,
) =>
  encodeVariant(
    selected
      ? {
          selected,
          resolved:
            selected === 'system' ? system : selected,
          system,
        }
      : undefined,
  );
