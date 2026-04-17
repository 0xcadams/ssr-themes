'use client';

import * as React from 'react';
import {
  createThemeController,
  pickThemeControllerOptions,
  type ThemeController,
} from './theme-controller';
import type {
  LightOrDark,
  ThemeOptions,
  ThemeProviderRuntimeProps,
  WithSystem,
} from './types';

/**
 * Framework-specific theme state returned by
 * `useTheme()`.
 *
 * Exposes the current selected theme, the
 * resolved document theme, the current system
 * theme, and a setter for updates.
 */
export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** All selectable theme names for this config */
  themes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  /** Theme forced for the current page, if any */
  forced?: TTheme | undefined;
  /** Updates the selected theme */
  setSelected: (
    value: React.SetStateAction<
      WithSystem<TTheme, TEnableSystem>
    >,
  ) => void;
  /** Current selected theme preference */
  selected?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Current concrete theme applied to the document */
  resolved?: Exclude<TTheme, 'system'> | undefined;
  /** Current browser system theme */
  system?: LightOrDark | undefined;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>
  extends
    ThemeOptions<TTheme, TEnableSystem>,
    ThemeProviderRuntimeProps<TTheme, TEnableSystem> {
  children?: React.ReactNode | undefined;
}

type ThemeContextValue = ThemeResult<string, boolean>;

const ThemeContext = React.createContext<
  ThemeContextValue | undefined
>(undefined);

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() => {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider.',
    );
  }

  return context as ThemeResult<TTheme, TEnableSystem>;
};

export const ThemeProvider = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const context = React.useContext(ThemeContext);

  // Ignore nested context providers
  if (context) return <>{props.children}</>;
  return <Theme {...props} />;
};

const Theme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const controllerOptions = React.useMemo(
    () =>
      pickThemeControllerOptions({
        attribute: props.attribute,
        cookie: props.cookie,
        defaultTheme: props.defaultTheme,
        disableTransition:
          props.disableTransition ?? true,
        enableColorScheme:
          props.enableColorScheme ?? true,
        enableSystem: props.enableSystem,
        forced: props.forced,
        initial: props.initial,
        nonce: props.nonce,
        themes: props.themes,
        valueMap: props.valueMap,
      }),
    [
      props.attribute,
      props.cookie,
      props.defaultTheme,
      props.disableTransition,
      props.enableColorScheme,
      props.enableSystem,
      props.forced,
      props.initial,
      props.nonce,
      props.themes,
      props.valueMap,
    ],
  );
  const controllerRef = React.useRef<ThemeController<
    TTheme,
    TEnableSystem
  > | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createThemeController(
      controllerOptions,
    );
  }

  const controller = controllerRef.current;
  const snapshot = React.useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  React.useEffect(() => {
    controller.update(controllerOptions);
  }, [controller, controllerOptions]);

  React.useEffect(() => {
    controller.start();

    return () => {
      controller.stop();
    };
  }, [controller]);

  const providerValue = React.useMemo(
    () => ({
      selected: snapshot.selected,
      setSelected: controller.setSelected,
      forced: snapshot.forced,
      resolved: snapshot.resolved,
      themes: snapshot.themes,
      system: snapshot.system,
    }),
    [
      controller,
      snapshot.forced,
      snapshot.resolved,
      snapshot.selected,
      snapshot.system,
      snapshot.themes,
    ],
  );

  return (
    <ThemeContext.Provider value={providerValue}>
      {props.children}
    </ThemeContext.Provider>
  );
};
