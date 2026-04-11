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
  type ThemeControllerOptions,
  type ThemeControllerSetValue,
} from './theme-controller';
import type {
  LightOrDark,
  ThemeOptions,
  ThemeProviderRuntimeProps,
  WithSystem,
} from './types';

export type ThemeSetter<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> = (
  value:
    | WithSystem<TTheme, TEnableSystem>
    | ((
        prev: WithSystem<TTheme, TEnableSystem>,
      ) => WithSystem<TTheme, TEnableSystem>),
) => void;

export interface ThemeResult<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  themes: Accessor<
    ReadonlyArray<WithSystem<TTheme, TEnableSystem>>
  >;
  forced: Accessor<TTheme | undefined>;
  setSelected: ThemeSetter<TTheme, TEnableSystem>;
  selected: Accessor<
    WithSystem<TTheme, TEnableSystem> | undefined
  >;
  resolved: Accessor<
    Exclude<TTheme, 'system'> | undefined
  >;
  system: Accessor<LightOrDark | undefined>;
}

export interface ThemeProviderProps<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>
  extends
    ThemeOptions<TTheme, TEnableSystem>,
    ThemeProviderRuntimeProps<TTheme, TEnableSystem> {
  children?: JSX.Element;
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

  return context as ThemeResult<TTheme, TEnableSystem>;
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

  const controller = createThemeController(
    pickThemeControllerOptions(
      props,
    ) as ThemeControllerOptions<string, boolean>,
  );
  const [snapshot, setSnapshot] = createSignal(
    controller.getSnapshot(),
  );
  const syncSnapshot = () => {
    setSnapshot(() => controller.getSnapshot());
  };

  createEffect(() => {
    controller.update(
      pickThemeControllerOptions(
        props,
      ) as ThemeControllerOptions<string, boolean>,
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

  const providerValue: ThemeContextValue = {
    selected: () => snapshot().selected,
    setSelected: value =>
      controller.setSelected(
        value as ThemeControllerSetValue<
          string,
          boolean
        >,
      ),
    forced: () => snapshot().forced,
    resolved: () => snapshot().resolved,
    themes: () => snapshot().themes,
    system: () => snapshot().system,
  };

  return createComponent(ThemeContext.Provider, {
    value: providerValue,
    get children() {
      return props.children;
    },
  });
};
