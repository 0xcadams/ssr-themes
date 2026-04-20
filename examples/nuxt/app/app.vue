<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  ResolvedThemeState,
} from 'ssr-themes';
import {
  registerTheme,
  parseThemeCookie,
  ThemeProvider,
  themeScript,
} from './lib/theme';

const themeState = useState<
  ResolvedThemeState<LightOrDark> | undefined
>('theme', () => {
  if (import.meta.client) {
    return undefined;
  }

  return parseThemeCookie(
    useRequestHeaders(['cookie']).cookie,
  );
});

const htmlAttrs = computed(() => {
  return {
    lang: 'en' as const,
    ...registerTheme(themeState.value, {
      renderMode: 'html-attrs',
    }),
  };
});

useHead({
  title: 'ssr-themes Nuxt example',
  meta: [
    {
      name: 'description',
      content:
        'Nuxt theme switching with SSR cookies.',
    },
  ],
  bodyAttrs: {
    class:
      'min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white',
  },
});

if (import.meta.server) {
  useHead(() => ({
    htmlAttrs: htmlAttrs.value,
    script: [
      {
        id: 'ssr-themes',
        innerHTML: themeScript(),
      },
    ],
  }));
}
</script>

<template>
  <ThemeProvider :initial="themeState">
    <NuxtPage />
  </ThemeProvider>
</template>
