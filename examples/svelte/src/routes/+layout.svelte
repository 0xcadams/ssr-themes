<script lang="ts">
  import {page} from '$app/state';
  import type {LightOrDark} from 'ssr-themes';
  import {
    ThemeProvider,
    ThemeScript,
  } from 'ssr-themes/svelte';

  import {themeConfig} from '$lib/theme';
  import '../app.css';
  import type {LayoutProps} from './$types';

  let {data, children}: LayoutProps = $props();

  let forcedTheme = $derived(
    page.data.forcedTheme as LightOrDark | undefined,
  );
</script>

<svelte:head>
  <title>ssr-themes svelte example</title>
  <meta
    name="description"
    content="SvelteKit SSR theme switching with forced routes."
  />
</svelte:head>

<ThemeScript {...themeConfig} />

<ThemeProvider
  {...themeConfig}
  initialTheme={data.initialTheme}
  {forcedTheme}
>
  <div
    class="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white"
  >
    {@render children()}
  </div>
</ThemeProvider>
