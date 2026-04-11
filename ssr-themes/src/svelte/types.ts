import type {Snippet} from 'svelte';
import type {Readable} from 'svelte/store';
import type {
  Attribute,
  CookieOptions,
  LightOrDark,
  ThemeOptions,
  ThemeProviderRuntimeProps,
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
  selected: Readable<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;
  forced: Readable<TTheme | undefined>;
  resolved: Readable<
    Exclude<TTheme, 'system'> | undefined
  >;
  system: Readable<LightOrDark | undefined>;
  themes: Readable<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  setSelected: (
    value: SetThemeValue<TTheme, TEnableSystem>,
  ) => void;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>
  extends
    ThemeOptions<TTheme, TEnableSystem>,
    ThemeProviderRuntimeProps<TTheme, TEnableSystem> {
  children?: Snippet | undefined;
}

export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  ThemeOptions,
  WithSystem,
};
