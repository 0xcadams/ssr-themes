<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';
import {useTheme} from 'ssr-themes/vue';

type ThemeName = WithSystem<LightOrDark>;

const {forcedTheme, setTheme, theme} = useTheme();

const selectedTheme = computed(
  () => theme.value ?? 'system',
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
</template>
