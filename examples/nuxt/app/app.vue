<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  ThemeCookieState,
  ThemeHtmlProps,
} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/vue';

const themeState = useState<
  ThemeCookieState<LightOrDark> | undefined
>('theme', () => {
  if (import.meta.client) {
    return undefined;
  }

  return themeFromCookieHeader(
    useRequestHeaders(['cookie']).cookie,
  );
});

const selectedTheme = computed(
  () => themeState.value?.selectedTheme,
);

const styleToString = (
  style?: ThemeHtmlProps['style'],
) => {
  if (!style) {
    return undefined;
  }

  const declarations = Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const property = key.startsWith('--')
        ? key
        : key.replace(
            /[A-Z]/g,
            match => `-${match.toLowerCase()}`,
          );

      return `${property}: ${value}`;
    });

  return declarations.length
    ? declarations.join('; ')
    : undefined;
};

const htmlAttrs = computed(() => {
  const {className, style, ...dataAttrs} =
    registerTheme(themeState.value);
  const styleText = styleToString(style);

  return {
    lang: 'en' as const,
    ...(className ? {class: className} : {}),
    ...(styleText ? {style: styleText} : {}),
    ...dataAttrs,
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
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap',
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
  <ThemeProvider :selected-theme="selectedTheme">
    <NuxtPage />
  </ThemeProvider>
</template>
