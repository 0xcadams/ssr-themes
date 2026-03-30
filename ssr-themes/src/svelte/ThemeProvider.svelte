<script
  lang="ts"
  generics="TTheme extends string = LightOrDark, TEnableSystem extends boolean = true"
>
  import {onDestroy, onMount} from 'svelte';
  import type {LightOrDark} from '../types';
  import {
    maybeGetTheme,
    setThemeContext,
  } from './context.js';
  import {createThemeController} from './theme-state.js';
  import type {ThemeProviderProps} from './types.js';

  let {
    attribute = 'class',
    children,
    cookie,
    defaultTheme,
    disableTransitionOnChange = true,
    enableColorScheme = true,
    enableSystem,
    forcedTheme,
    initialTheme,
    nonce,
    themes,
    valueMap,
  }: ThemeProviderProps<
    TTheme,
    TEnableSystem
  > = $props();

  const parentTheme = maybeGetTheme<
    TTheme,
    TEnableSystem
  >();
  const getOptions = () => ({
    attribute,
    cookie,
    defaultTheme,
    disableTransitionOnChange,
    enableColorScheme,
    enableSystem,
    forcedTheme,
    initialTheme,
    nonce,
    themes,
    valueMap,
  });
  const controller = parentTheme
    ? null
    : createThemeController<TTheme, TEnableSystem>(
        getOptions(),
      );

  if (controller) {
    setThemeContext(controller.context);
  }

  onMount(() => {
    controller?.start();
  });

  onDestroy(() => {
    controller?.destroy();
  });

  $effect(() => {
    controller?.update(getOptions());
  });
</script>

{@render children?.()}
