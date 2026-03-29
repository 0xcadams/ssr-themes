<script lang="ts">
  import {onMount} from 'svelte';

  import type {
    LightOrDark,
    WithSystem,
  } from 'ssr-themes';
  import {getTheme} from 'ssr-themes/svelte';

  const {forcedTheme, setTheme, theme} = getTheme<
    LightOrDark,
    true
  >();
  let mounted = $state(false);

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setTheme(select.value as WithSystem<LightOrDark>);
  };

  onMount(() => {
    mounted = true;
  });
</script>

<select
  id="theme-selector"
  class="rounded border border-current bg-transparent px-3 py-2 text-xl"
  value={$theme ?? 'system'}
  onchange={handleChange}
  disabled={!mounted || $forcedTheme !== undefined}
  aria-label="Theme"
  data-test-id="theme-selector"
>
  <option value="system">System</option>
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</select>
