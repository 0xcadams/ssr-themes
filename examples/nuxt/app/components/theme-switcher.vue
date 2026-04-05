<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';
import {useTheme} from '../lib/theme';

type ThemeName = WithSystem<LightOrDark>;

const {forcedTheme, setTheme, theme, colorScheme} =
  useTheme();
const codeClassName =
  'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

const selectedTheme = computed(
  () => theme.value ?? 'system',
);
const deviceTheme = computed(
  () => colorScheme.value ?? 'dark',
);
const suggestedTheme = computed(() =>
  deviceTheme.value === 'dark' ? 'light' : 'dark',
);

const handleChange = (event: Event) => {
  const select =
    event.currentTarget as HTMLSelectElement;
  setTheme(select.value as ThemeName);
};
</script>

<template>
  <select
    id="theme-selector"
    class="rounded border border-current bg-transparent px-3 py-2 text-xl"
    :disabled="Boolean(forcedTheme)"
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

  <p
    class="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60"
  >
    Try
    <code :class="codeClassName">{{
      suggestedTheme
    }}</code
    >, refresh the page, and check that the select
    never briefly shows
    <code :class="codeClassName">{{
      deviceTheme
    }}</code>
    first.
  </p>
</template>
