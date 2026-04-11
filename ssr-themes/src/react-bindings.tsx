'use client';

import * as React from 'react';
import {
  createThemeController,
  pickThemeControllerOptions,
  type ThemeController,
} from './theme-controller';
import {defaultThemes} from './theme-runtime';
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
  forcedTheme?: TTheme | undefined;
  /** Update the theme */
  setTheme: React.Dispatch<
    React.SetStateAction<
      WithSystem<TTheme, TEnableSystem>
    >
  >;
  /** Active theme name */
  theme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?:
    | Exclude<TTheme, 'system'>
    | undefined;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  colorScheme?: TEnableSystem extends false
    ? undefined
    : LightOrDark;
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
const defaultContext: ThemeContextValue = {
  setTheme: _ => {},
  themes: [],
};

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() =>
  (React.useContext(ThemeContext) ??
    defaultContext) as unknown as ThemeResult<
    TTheme,
    TEnableSystem
  >;

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
        disableTransitionOnChange:
          props.disableTransitionOnChange ?? true,
        enableColorScheme:
          props.enableColorScheme ?? true,
        enableSystem: props.enableSystem,
        forcedTheme: props.forcedTheme,
        colorScheme: props.colorScheme,
        nonce: props.nonce,
        selectedTheme: props.selectedTheme,
        themes:
          props.themes ??
          (defaultThemes as unknown as readonly TTheme[]),
        valueMap: props.valueMap,
      }),
    [
      props.attribute,
      props.cookie,
      props.defaultTheme,
      props.disableTransitionOnChange,
      props.enableColorScheme,
      props.enableSystem,
      props.forcedTheme,
      props.colorScheme,
      props.nonce,
      props.selectedTheme,
      props.themes,
      props.valueMap,
    ],
  );
  const controllerRef = React.useRef<ThemeController<
    TTheme,
    TEnableSystem
  > | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createThemeController<
      TTheme,
      TEnableSystem
    >(controllerOptions);
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
    () =>
      ({
        theme: snapshot.theme,
        setTheme:
          controller.setTheme as React.Dispatch<
            React.SetStateAction<
              WithSystem<TTheme, TEnableSystem>
            >
          >,
        forcedTheme: snapshot.forcedTheme,
        resolvedTheme: snapshot.resolvedTheme,
        themes: snapshot.themes,
        colorScheme:
          snapshot.colorScheme as TEnableSystem extends false
            ? undefined
            : LightOrDark,
      }) as ThemeResult<TTheme, TEnableSystem>,
    [
      controller,
      snapshot.colorScheme,
      snapshot.forcedTheme,
      snapshot.resolvedTheme,
      snapshot.theme,
      snapshot.themes,
    ],
  );

  return (
    <ThemeContext.Provider
      value={
        providerValue as unknown as ThemeContextValue
      }
    >
      {props.children}
    </ThemeContext.Provider>
  );
};
