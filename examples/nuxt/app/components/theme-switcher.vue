<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';
import {useTheme} from 'ssr-themes/vue';

type ThemeName = WithSystem<LightOrDark>;

const {forcedTheme, setTheme, theme, colorScheme} =
  useTheme();
const codeClassName =
  'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';
const isMounted = ref(false);

const selectedTheme = computed(
  () => theme.value ?? 'system',
);
const clientColorScheme = computed(() =>
  isMounted.value ? colorScheme.value : undefined,
);
const suggestedTheme = computed(() =>
  clientColorScheme.value === 'dark'
    ? 'light'
    : clientColorScheme.value === 'light'
      ? 'dark'
      : undefined,
);
const flashedTheme = computed(() =>
  suggestedTheme.value === 'dark'
    ? 'light'
    : suggestedTheme.value === 'light'
      ? 'dark'
      : undefined,
);

const handleChange = (event: Event) => {
  const select =
    event.currentTarget as HTMLSelectElement;
  setTheme(select.value as ThemeName);
};

onMounted(() => {
  isMounted.value = true;
});
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
    <template v-if="suggestedTheme && flashedTheme">
      Try
      <code :class="codeClassName">{{
        suggestedTheme
      }}</code
      >, refresh the page, and watch whether the select
      briefly flashes
      <code :class="codeClassName">{{
        flashedTheme
      }}</code>
      before settling on
      <code :class="codeClassName">{{
        suggestedTheme
      }}</code
      >.
    </template>
    <template v-else>
      Try the theme opposite your device setting,
      refresh the page, and watch whether the select
      briefly flashes the wrong value before settling
      on your choice.
    </template>
  </p>
</template>
