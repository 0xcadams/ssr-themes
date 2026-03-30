<script lang="ts">
  import {themeScript} from 'ssr-themes';
  import {ThemeProvider} from 'ssr-themes/svelte';

  import {themeConfig} from '$lib/theme';
  import '../app.css';
  import type {LayoutProps} from './$types';

  let {data, children}: LayoutProps = $props();
</script>

<svelte:head>
  <title>ssr-themes svelte example</title>
  <meta
    name="description"
    content="SvelteKit SSR theme switching with cookies."
  />
  <script id="ssr-themes">
    {
      themeScript(themeConfig);
    }
  </script>
</svelte:head>

<ThemeProvider
  {...themeConfig}
  initialTheme={data.initialTheme}
>
  <div
    class="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white"
  >
    {@render children()}
  </div>
</ThemeProvider>
