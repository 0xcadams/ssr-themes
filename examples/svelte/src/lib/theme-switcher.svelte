<script lang="ts">
  import type {
    LightOrDark,
    WithSystem,
  } from 'ssr-themes';
  import {encodeVariant, useTheme} from '$lib/theme';

  const {setSelected, selected, system} = useTheme();
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';
  const selectClassName =
    'appearance-none rounded border border-current bg-transparent px-3 py-2 pr-10 text-xl';

  let deviceTheme: LightOrDark;
  let selectedTheme: WithSystem<LightOrDark>;
  let suggestedTheme: LightOrDark;
  let cookieValue: string;

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setSelected(
      select.value as WithSystem<LightOrDark>,
    );
  };

  $: selectedTheme = $selected ?? 'system';
  $: deviceTheme = $system ?? 'dark';
  $: suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';
  $: cookieValue =
    encodeVariant({
      selected: selectedTheme,
      resolved:
        selectedTheme === 'system'
          ? deviceTheme
          : selectedTheme,
      system: deviceTheme,
    }) ?? (deviceTheme === 'dark' ? '~d' : '~l');
</script>

<div class="relative mx-auto w-fit">
  <select
    id="theme-selector"
    class={selectClassName}
    value={selectedTheme}
    on:change={handleChange}
    aria-label="Theme"
    data-test-id="theme-selector"
  >
    <option value="system">System</option>
    <option value="dark">Dark</option>
    <option value="light">Light</option>
  </select>

  <span
    class="pointer-events-none absolute inset-y-0 right-3 flex items-center opacity-70"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="m2.5 4.5 3.5 3.5 3.5-3.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</div>

<p
  class="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60"
>
  The theme cookie is set to <code
    class={codeClassName}
    data-test-id="theme-cookie-value"
    >{cookieValue}</code
  >. Try
  <code
    class={codeClassName}
    data-test-id="theme-suggested-theme"
    >{suggestedTheme}</code
  >, refresh the page, and check that the select
  doesn't flash your system's
  <code
    class={codeClassName}
    data-test-id="theme-system-setting"
    >{deviceTheme}</code
  > setting first.
</p>
