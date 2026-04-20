<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';
import {encodeVariant, useTheme} from '../lib/theme';

type ThemeName = WithSystem<LightOrDark>;

const {forced, setSelected, selected, system} =
  useTheme();
const codeClassName =
  'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';
const selectClassName =
  'appearance-none rounded border border-current bg-transparent px-3 py-2 pr-10 text-xl disabled:cursor-not-allowed disabled:opacity-60';

const selectedTheme = computed(
  () => selected.value ?? 'system',
);
const deviceTheme = computed(
  () => system.value ?? 'dark',
);
const suggestedTheme = computed(() =>
  deviceTheme.value === 'dark' ? 'light' : 'dark',
);
const cookieValue = computed(
  () =>
    encodeVariant({
      selected: selectedTheme.value,
      resolved:
        selectedTheme.value === 'system'
          ? deviceTheme.value
          : selectedTheme.value,
      system: deviceTheme.value,
    }) ?? (deviceTheme.value === 'dark' ? '~d' : '~l'),
);

const handleChange = (event: Event) => {
  const select =
    event.currentTarget as HTMLSelectElement;
  setSelected(select.value as ThemeName);
};
</script>

<template>
  <div class="relative mx-auto w-fit">
    <select
      id="theme-selector"
      :class="selectClassName"
      :disabled="Boolean(forced)"
      aria-label="Theme"
      data-test-id="theme-selector"
      @change="handleChange"
    >
      <option
        value="system"
        :selected="selectedTheme === 'system'"
      >
        System
      </option>
      <option
        value="dark"
        :selected="selectedTheme === 'dark'"
      >
        Dark
      </option>
      <option
        value="light"
        :selected="selectedTheme === 'light'"
      >
        Light
      </option>
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
    The theme cookie is set to
    <code
      :class="codeClassName"
      data-test-id="theme-cookie-value"
      >{{ cookieValue }}</code
    >. Try
    <code
      :class="codeClassName"
      data-test-id="theme-suggested-theme"
      >{{ suggestedTheme }}</code
    >, refresh the page, and check that the select
    doesn't flash your system's
    <code
      :class="codeClassName"
      data-test-id="theme-system-setting"
      >{{ deviceTheme }}</code
    >
    setting first.
  </p>
</template>
