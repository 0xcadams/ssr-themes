<script lang="ts">
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

  let deviceTheme: LightOrDark;
  let suggestedTheme: LightOrDark;

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setTheme(select.value as WithSystem<LightOrDark>);
  };

  $: deviceTheme = $colorScheme ?? 'dark';
  $: suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';
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
  Try <code class={codeClassName}
    >{suggestedTheme}</code
  >, refresh the page, and check that the select never
  briefly shows
  <code class={codeClassName}>{deviceTheme}</code> first.
</p>
