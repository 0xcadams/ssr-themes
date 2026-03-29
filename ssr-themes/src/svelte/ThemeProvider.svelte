<script
  lang="ts"
  generics="TTheme extends string = LightOrDark, TEnableSystem extends boolean = true"
>
  import {onDestroy, onMount} from 'svelte';

  import {setThemeContext} from './context.js';
  import type {LightOrDark} from './core-types.js';
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

  const controller = createThemeController<
    TTheme,
    TEnableSystem
  >(getOptions());

  setThemeContext(controller.context);

  onMount(() => {
    controller.start();
  });

  onDestroy(() => {
    controller.destroy();
  });

  $effect(() => {
    controller.update(getOptions());
  });
</script>

{@render children?.()}
