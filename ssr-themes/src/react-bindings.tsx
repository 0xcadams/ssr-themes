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

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  /** List of all available theme names */
  themes: ReadonlyArray<
    WithSystem<TTheme, TEnableSystem>
  >;
  /** Forced theme name for the current page */
  forced?: TTheme | undefined;
  /** Update the theme */
  setSelected: (
    value: React.SetStateAction<
      WithSystem<TTheme, TEnableSystem>
    >,
  ) => void;
  /** Active theme name */
  selected?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** Active literal theme name applied to the document */
  resolved?: Exclude<TTheme, 'system'> | undefined;
  /** Current browser system preference */
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

  const controller = controllerRef.current!;
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
    () =>
      ({
        selected: snapshot.selected,
        setSelected: controller.setSelected,
        forced: snapshot.forced,
        resolved: snapshot.resolved,
        themes: snapshot.themes,
        system: snapshot.system,
      }) as ThemeResult<TTheme, TEnableSystem>,
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
    <ThemeContext.Provider
      value={providerValue as ThemeContextValue}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};
