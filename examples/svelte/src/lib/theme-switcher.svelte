<script lang="ts">
  import {onMount} from 'svelte';
  import type {
    LightOrDark,
    WithSystem,
  } from 'ssr-themes';
  import {getTheme} from 'ssr-themes/svelte';

  const {setTheme, theme, colorScheme} = getTheme<
    LightOrDark,
    true
  >();
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  let mounted = false;
  let clientColorScheme: LightOrDark | undefined;
  let suggestedTheme: LightOrDark | undefined;
  let flashedTheme: LightOrDark | undefined;

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setTheme(select.value as WithSystem<LightOrDark>);
  };

  onMount(() => {
    mounted = true;
  });

  $: clientColorScheme = mounted
    ? $colorScheme
    : undefined;
  $: suggestedTheme =
    clientColorScheme === 'dark'
      ? 'light'
      : clientColorScheme === 'light'
        ? 'dark'
        : undefined;
  $: flashedTheme =
    suggestedTheme === 'dark'
      ? 'light'
      : suggestedTheme === 'light'
        ? 'dark'
        : undefined;
</script>

<select
  id="theme-selector"
  class="rounded border border-current bg-transparent px-3 py-2 text-xl"
  value={$theme ?? 'system'}
  on:change={handleChange}
  aria-label="Theme"
  data-test-id="theme-selector"
>
  <option value="system">System</option>
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</select>

<p
  class="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60"
>
  {#if suggestedTheme && flashedTheme}
    Try <code class={codeClassName}
      >{suggestedTheme}</code
    >, refresh the page, and watch whether the select
    briefly flashes
    <code class={codeClassName}>{flashedTheme}</code>
    before settling on
    <code class={codeClassName}>{suggestedTheme}</code
    >.
  {:else}
    Try the theme opposite your device setting, refresh
    the page, and watch whether the select briefly
    flashes the wrong value before settling on your
    choice.
  {/if}
</p>
