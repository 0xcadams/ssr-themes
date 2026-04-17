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

/**
 * Framework-specific theme state returned by
 * `useTheme()`.
 *
 * Exposes the current selected theme, the
 * resolved document theme, the current system
 * theme, and a setter for updates.
 */
export interface ThemeContext<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** Current selected theme preference */
  selected: Readable<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;

  /** Theme forced for the current page, if any */
  forced: Readable<TTheme | undefined>;

  /** Current concrete theme applied to the document */
  resolved: Readable<
    Exclude<TTheme, 'system'> | undefined
  >;

  /** Current browser system theme */
  system: Readable<LightOrDark | undefined>;

  /** All selectable theme names for this config */
  themes: Readable<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;

  /** Updates the selected theme */
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
