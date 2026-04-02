import {derived, writable} from 'svelte/store';
import {
  createThemeController as createThemeControllerCore,
  type ThemeControllerSetValue,
} from '../theme-controller';
import type {LightOrDark} from '../types';
import type {
  ThemeContext,
  ThemeProviderProps,
} from './types.js';

type ThemeController<
  TTheme extends string,
  TEnableSystem extends boolean,
> = {
  context: ThemeContext<TTheme, TEnableSystem>;
  destroy: () => void;
  start: () => void;
  update: (
    nextOptions: ThemeProviderProps<
      TTheme,
      TEnableSystem
    >,
  ) => void;
};

export const createThemeController = <
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
>(
  initialOptions: ThemeProviderProps<
    TTheme,
    TEnableSystem
  >,
): ThemeController<TTheme, TEnableSystem> => {
  const controller = createThemeControllerCore(
    initialOptions,
  );
  const snapshotStore = writable(
    controller.getSnapshot(),
  );

  const syncSnapshot = () => {
    snapshotStore.set(controller.getSnapshot());
  };

  const unsubscribe =
    controller.subscribe(syncSnapshot);
  const setTheme = (
    value: ThemeControllerSetValue<
      TTheme,
      TEnableSystem
    >,
  ) => {
    controller.setTheme(value);
  };

  return {
    context: {
      theme: derived(
        snapshotStore,
        snapshot => snapshot.theme,
      ),
      forcedTheme: derived(
        snapshotStore,
        snapshot => snapshot.forcedTheme,
      ),
      resolvedTheme: derived(
        snapshotStore,
        snapshot => snapshot.resolvedTheme,
      ),
      colorScheme: derived(
        snapshotStore,
        snapshot => snapshot.colorScheme,
      ),
      themes: derived(
        snapshotStore,
        snapshot => snapshot.themes,
      ),
      setTheme,
    },
    destroy: () => {
      unsubscribe();
      controller.stop();
    },
    start: () => {
      controller.start();
      syncSnapshot();
    },
    update: nextOptions => {
      controller.update(nextOptions);
      syncSnapshot();
    },
  };
};
