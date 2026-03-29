<script
  lang="ts"
  generics="TTheme extends string = LightOrDark, TEnableSystem extends boolean = true"
>
  import type {LightOrDark} from './core-types.js';
  import {svelteThemeScript} from './theme-script.js';
  import type {ThemeScriptProps} from './types.js';

  let {
    attribute = 'class',
    cookie,
    defaultTheme,
    enableColorScheme = true,
    enableSystem,
    forcedTheme,
    nonce,
    themes,
    valueMap,
  }: ThemeScriptProps<
    TTheme,
    TEnableSystem
  > = $props();
</script>

<svelte:head>
  <script id="ssr-themes" {nonce}>
    {svelteThemeScript({
      attribute,
      cookie,
      defaultTheme,
      enableColorScheme,
      enableSystem,
      forcedTheme,
      themes,
      valueMap,
    })}
  </script>
</svelte:head>
