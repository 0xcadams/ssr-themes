<script lang="ts">
  import type {
    LightOrDark,
    WithSystem,
  } from 'ssr-themes';
  import {getTheme} from 'ssr-themes/svelte';

  const {setTheme, theme} = getTheme<
    LightOrDark,
    true
  >();

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setTheme(select.value as WithSystem<LightOrDark>);
  };
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
