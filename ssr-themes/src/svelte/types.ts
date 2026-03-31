import type {Snippet} from 'svelte';
import type {Readable} from 'svelte/store';
import type {
  Attribute,
  CookieOptions,
  LightOrDark,
  ThemeOptions,
  WithSystem,
} from '../types';

export type SetThemeValue<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> =
  | WithSystem<TTheme, TEnableSystem>
  | ((
      previous: WithSystem<TTheme, TEnableSystem>,
    ) => WithSystem<TTheme, TEnableSystem>);

export interface ThemeContext<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  theme: Readable<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;
  forcedTheme: Readable<TTheme | undefined>;
  resolvedTheme: Readable<
    Exclude<TTheme, 'system'> | undefined
  >;
  colorScheme: Readable<
    TEnableSystem extends true
      ? LightOrDark | undefined
      : undefined
  >;
  themes: Readable<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  setTheme: (
    value: SetThemeValue<TTheme, TEnableSystem>,
  ) => void;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> extends ThemeOptions<TTheme, TEnableSystem> {
  children?: Snippet | undefined;
  disableTransitionOnChange?: boolean | undefined;
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string | undefined;
}

export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  ThemeOptions,
  WithSystem,
};
