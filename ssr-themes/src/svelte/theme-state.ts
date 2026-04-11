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
  const setSelected = (
    value: ThemeControllerSetValue<
      TTheme,
      TEnableSystem
    >,
  ) => {
    controller.setSelected(value);
  };

  return {
    context: {
      selected: derived(
        snapshotStore,
        snapshot => snapshot.selected,
      ),
      forced: derived(
        snapshotStore,
        snapshot => snapshot.forced,
      ),
      resolved: derived(
        snapshotStore,
        snapshot => snapshot.resolved,
      ),
      system: derived(
        snapshotStore,
        snapshot => snapshot.system,
      ),
      themes: derived(
        snapshotStore,
        snapshot => snapshot.themes,
      ),
      setSelected,
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
