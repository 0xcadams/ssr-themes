import type {Accessor, JSX} from 'solid-js';
import type {
  LightOrDark,
  ThemeOptions,
  WithSystem,
} from './types';

export type ThemeSetter<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = (
  value:
    | WithSystem<TTheme, TEnableSystem>
    | ((
        prev:
          | WithSystem<TTheme, TEnableSystem>
          | undefined,
      ) => WithSystem<TTheme, TEnableSystem>),
) => WithSystem<TTheme, TEnableSystem>;

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  themes: Accessor<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  forcedTheme: Accessor<TTheme | undefined>;
  setTheme: ThemeSetter<TTheme, TEnableSystem>;
  theme: Accessor<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;
  resolvedTheme: Accessor<
    Exclude<TTheme, 'system'> | undefined
  >;
  colorScheme: Accessor<
    TEnableSystem extends true
      ? LightOrDark
      : undefined
  >;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeOptions<TTheme, TEnableSystem> {
  children?: JSX.Element;
  disableTransitionOnChange?: boolean | undefined;
  initialTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string;
}

export type ThemeContextValue = ThemeResult<
  string,
  boolean
>;
