import {codeToHtml} from 'shiki';

export type FrameworkId =
  | 'astro'
  | 'next'
  | 'nuxt'
  | 'solid'
  | 'svelte'
  | 'tanstack'
  | 'other';

type FrameworkSnippet =
  | string
  | {
      code: string;
      lang: 'astro' | 'svelte' | 'tsx' | 'vue';
    };

type FrameworkSnippets = Record<
  FrameworkId,
  {
    primary: FrameworkSnippet;
    secondary: FrameworkSnippet;
  }
>;

export type HighlightedFrameworkSnippets = Record<
  FrameworkId,
  {
    primaryHtml: string;
    secondaryHtml: string;
  }
>;

const frameworkSnippets: FrameworkSnippets = {
  astro: {
    primary: {
      lang: 'astro',
      code: `---
import ThemeSwitcher from '../components/theme-switcher';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from '../lib/theme';
import type {ThemeHtmlProps} from 'ssr-themes';

const themeState = themeFromCookieHeader(
  Astro.request.headers.get('cookie'),
);

const styleToString = (
  style?: ThemeHtmlProps['style'],
) => {
  if (!style) return undefined;

  const declarations = Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const property = key.replace(
        /[A-Z]/g,
        match => \`-\${match.toLowerCase()}\`,
      );

      return \`\${property}: \${value}\`;
    });

  return declarations.length
    ? declarations.join('; ')
    : undefined;
};

const {className, style, ...themeHtmlProps} =
  registerTheme(themeState);
---

<html
  lang="en"
  class={className}
  style={styleToString(style)}
  {...themeHtmlProps}
>
  <head>
    <script id="ssr-themes" is:inline set:html={themeScript()} />
  </head>
  <body>
    <ThemeSwitcher client:load selectedTheme={themeState?.selectedTheme} />
  </body>
</html>
`,
    },
    secondary: `// src/lib/theme.ts
import {initTheme} from 'ssr-themes';

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = initTheme();

// src/lib/theme-react.tsx
import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} = bindTheme(options);
`,
  },
  next: {
    primary: `// app/theme.ts
import {initTheme} from 'ssr-themes';

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = initTheme();

// app/theme-react.tsx
'use client';

import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} = bindTheme(options);
`,
    secondary: `// app/layout.tsx
import {headers} from 'next/headers';
import Script from 'next/script';
import {ThemeProvider} from './theme-react';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from './theme';

export default async function RootLayout({children}) {
  const themeState = themeFromCookieHeader(
    (await headers()).get('cookie'),
  );

  return (
    <html suppressHydrationWarning {...registerTheme(themeState)}>
      <head>
        <Script id="ssr-themes" strategy="beforeInteractive">
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider selectedTheme={themeState?.selectedTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
  },
  nuxt: {
    primary: {
      lang: 'vue',
      code: `<!-- app/lib/theme.ts -->
<script lang="ts">
import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = initTheme();

export const {ThemeProvider, useTheme} = bindTheme(options);
</script>

<!-- app/app.vue -->
<script setup lang="ts">
import {computed} from 'vue';
import type {
  LightOrDark,
  ThemeCookieState,
  ThemeHtmlProps,
} from 'ssr-themes';
import {
  registerTheme,
  ThemeProvider,
  themeFromCookieHeader,
  themeScript,
} from './lib/theme';

const themeState = useState<
  ThemeCookieState<LightOrDark> | undefined
>('theme', () => {
  if (import.meta.client) return undefined;

  return themeFromCookieHeader(
    useRequestHeaders(['cookie']).cookie,
  );
});

const styleToString = (
  style?: ThemeHtmlProps['style'],
) => {
  if (!style) return undefined;

  return Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => \`\${key}: \${value}\`)
    .join('; ');
};

const htmlAttrs = computed(() => {
  const {className, style, ...dataAttrs} =
    registerTheme(themeState.value);
  const styleText = styleToString(style);

  return {
    ...(className ? {class: className} : {}),
    ...(styleText ? {style: styleText} : {}),
    ...dataAttrs,
  };
});

if (import.meta.server) {
  useHead(() => ({
    htmlAttrs: htmlAttrs.value,
    script: [{id: 'ssr-themes', innerHTML: themeScript()}],
  }));
}
</script>

<template>
  <ThemeProvider :selected-theme="themeState?.selectedTheme">
    <NuxtPage />
  </ThemeProvider>
</template>
`,
    },
    secondary: {
      lang: 'vue',
      code: `<!-- app/components/theme-switcher.vue -->
<script setup lang="ts">
import {computed} from 'vue';
import type {LightOrDark, WithSystem} from 'ssr-themes';
import {useTheme} from '../lib/theme';

type ThemeName = WithSystem<LightOrDark>;

const {setTheme, theme} = useTheme();
const selectedTheme = computed(() => theme.value ?? 'system');

const handleChange = (event: Event) => {
  const select = event.currentTarget as HTMLSelectElement;
  setTheme(select.value as ThemeName);
};
</script>

<template>
  <select @change="handleChange">
    <option value="system" :selected="selectedTheme === 'system'">System</option>
    <option value="dark" :selected="selectedTheme === 'dark'">Dark</option>
    <option value="light" :selected="selectedTheme === 'light'">Light</option>
  </select>
</template>
`,
    },
  },
  solid: {
    primary: `// src/lib/theme.ts
import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/solid';
import {getRequestEvent, isServer} from 'solid-js/web';

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = initTheme();

export const {ThemeProvider, useTheme} = bindTheme(options);

export const getThemeState = () =>
  themeFromCookieHeader(
    isServer
      ? getRequestEvent()?.request.headers.get('cookie')
      : document.cookie,
  );
`,
    secondary: `// src/app.tsx
import {ThemeProvider, getThemeState} from '~/lib/theme';

export default function App() {
  const themeState = getThemeState();

  return (
    <ThemeProvider selectedTheme={themeState?.selectedTheme}>
      {/* ... */}
    </ThemeProvider>
  );
}

// src/entry-server.tsx
import {getThemeState, registerTheme, themeScript} from '~/lib/theme';

const themeState = getThemeState();
const htmlProps = registerTheme(themeState);
<html class={htmlProps.className} style={htmlProps.style}>
  <head>
    <script innerHTML={themeScript()} />
  </head>
</html>;
`,
  },
  svelte: {
    primary: {
      lang: 'svelte',
      code: `<!-- src/lib/theme.ts -->
<script lang="ts">
  import {initTheme} from 'ssr-themes';
  import {bindTheme} from 'ssr-themes/svelte';

  export const {
    options,
    registerTheme,
    themeFromCookieHeader,
    themeScript,
  } = initTheme({attribute: 'class', themes: ['dark', 'light']});

  export const {ThemeProvider, useTheme} = bindTheme(options);
</script>

<!-- src/hooks.server.ts -->
<script lang="ts">
  import type {Handle} from '@sveltejs/kit';
  import {registerTheme, themeFromCookieHeader, themeScript} from '$lib/theme';

  export const handle: Handle = async ({event, resolve}) => {
    const themeState = themeFromCookieHeader(event.request.headers.get('cookie'));
    event.locals.themeState = themeState;

    return resolve(event, {
      transformPageChunk: ({html}) =>
        html
          .replace(
            '%ssr-themes.html-attrs%',
            registerTheme(themeState, {renderMode: 'html-string'}),
          )
          .replace('%ssr-themes.script%', themeScript()),
    });
  };
</script>
`,
    },
    secondary: {
      lang: 'svelte',
      code: `<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import {ThemeProvider} from '$lib/theme';
  let {data, children} = $props();
</script>

<ThemeProvider selectedTheme={data.themeState?.selectedTheme}>
  {@render children()}
</ThemeProvider>

<!-- src/lib/theme-switcher.svelte -->
<script lang="ts">
  import type {LightOrDark, WithSystem} from 'ssr-themes';
  import {useTheme} from '$lib/theme';

  const {setTheme, theme} = useTheme();

  const handleChange = (event: Event) => {
    const select = event.currentTarget as HTMLSelectElement;
    setTheme(select.value as WithSystem<LightOrDark>);
  };
</script>

<select value={$theme ?? 'system'} on:change={handleChange}>
  <option value="system">System</option>
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</select>
`,
    },
  },
  tanstack: {
    primary: `// src/lib/theme.ts
import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

export const {
  options,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} = initTheme();

export const {ThemeProvider, useTheme} = bindTheme(options);
`,
    secondary: `// src/routes/__root.tsx
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import {
  ThemeProvider,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from '../lib/theme';

const getThemeState = createServerFn({method: 'GET'}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie')),
);

function RootComponent() {
  const {themeState} = Route.useLoaderData();

  return (
    <html suppressHydrationWarning {...registerTheme(themeState)}>
      <body>
        <ThemeProvider selectedTheme={themeState?.selectedTheme}>
          <ScriptOnce children={themeScript()} />
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
  },
  other: {
    primary: `import {initTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

const {options, themeScript} = initTheme();
const {ThemeProvider} = bindTheme(options);

const html = \`<html>
  <head>
    <script id="ssr-themes">\${themeScript()}</script>
  </head>
  <body><!-- ... --></body>
</html>\`;

export function App() {
  return <ThemeProvider>{/* ... */}</ThemeProvider>;
}
`,
    secondary: `import {initTheme} from 'ssr-themes';

const {registerTheme, themeFromCookieHeader} = initTheme();

export function handleRequest(request: Request) {
  const themeState = themeFromCookieHeader(request.headers.get('cookie'));
  const htmlProps = registerTheme(themeState);

  return <html suppressHydrationWarning {...htmlProps} />;
}
`,
  },
};

const highlightCode = (snippet: FrameworkSnippet) => {
  const code =
    typeof snippet === 'string'
      ? snippet
      : snippet.code;
  const lang =
    typeof snippet === 'string' ? 'tsx' : snippet.lang;

  return codeToHtml(code, {
    lang,
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  });
};

let cachedHighlights: Promise<HighlightedFrameworkSnippets> | null =
  null;

const highlightSnippets = async () => {
  const entries = Object.entries(
    frameworkSnippets,
  ) as Array<
    [FrameworkId, FrameworkSnippets[FrameworkId]]
  >;

  const results = await Promise.all(
    entries.map(async ([framework, snippets]) => {
      const primaryHtml = await highlightCode(
        snippets.primary,
      );
      const secondaryHtml = await highlightCode(
        snippets.secondary,
      );
      return [
        framework,
        {primaryHtml, secondaryHtml},
      ] as const;
    }),
  );

  return Object.fromEntries(
    results,
  ) as HighlightedFrameworkSnippets;
};

export const getHighlightedFrameworkSnippets =
  async (): Promise<HighlightedFrameworkSnippets> => {
    if (process.env.NODE_ENV === 'development') {
      return highlightSnippets();
    }

    if (!cachedHighlights) {
      cachedHighlights = highlightSnippets();
    }

    return cachedHighlights;
  };
