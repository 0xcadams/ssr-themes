import type {Accessor, JSX} from 'solid-js';
import {
  createComponent,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';
import {
  createThemeController,
  pickThemeControllerOptions,
  type ThemeControllerSetValue,
} from './theme-controller';
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
  selectedTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  nonce?: string;
}

export type ThemeContextValue = ThemeResult<
  string,
  boolean
>;

export const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);

export const useTheme = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>() => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider.',
    );
  }

  return context as unknown as ThemeResult<
    TTheme,
    TEnableSystem
  >;
};

export const ThemeProvider = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  props: ThemeProviderProps<TTheme, TEnableSystem>,
) => {
  const context = useContext(ThemeContext);

  if (context) {
    return props.children;
  }

  const controller = createThemeController<
    TTheme,
    TEnableSystem
  >(pickThemeControllerOptions(props));
  const [snapshot, setSnapshot] = createSignal(
    controller.getSnapshot(),
  );
  const syncSnapshot = () => {
    setSnapshot(() => controller.getSnapshot());
  };

  const setTheme: ThemeSetter<
    TTheme,
    TEnableSystem
  > = value =>
    controller.setTheme(
      value as ThemeControllerSetValue<
        TTheme,
        TEnableSystem
      >,
    );

  createEffect(() => {
    controller.update(
      pickThemeControllerOptions(props),
    );
    syncSnapshot();
  });

  onMount(() => {
    const unsubscribe =
      controller.subscribe(syncSnapshot);

    controller.start();
    syncSnapshot();

    onCleanup(() => {
      unsubscribe();
      controller.stop();
    });
  });

  const providerValue: ThemeResult<
    TTheme,
    TEnableSystem
  > = {
    theme: () => snapshot().theme,
    setTheme,
    forcedTheme: () => snapshot().forcedTheme,
    resolvedTheme: () => snapshot().resolvedTheme,
    themes: () => snapshot().themes,
    colorScheme: () =>
      snapshot()
        .colorScheme as TEnableSystem extends true
        ? LightOrDark
        : undefined,
  };

  return createComponent(ThemeContext.Provider, {
    value:
      providerValue as unknown as ThemeContextValue,
    get children() {
      return props.children;
    },
  });
};

export type {
  Attribute,
  CookieOptions,
  LightOrDark,
  RegisterThemeOptions,
  ThemeHtmlProps,
  ThemeOptions,
  WithSystem,
} from './types';
