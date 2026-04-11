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
  parseThemeCookie,
  themeScript,
} from '../lib/theme';

const themeState = parseThemeCookie(
  Astro.request.headers.get('cookie'),
);
const htmlProps = registerTheme(themeState, {
  renderMode: 'html-attrs',
});
---

<html lang="en" {...htmlProps}>
  <head>
    <script
      id="ssr-themes"
      is:inline
      set:html={themeScript()}
    />
  </head>
  <body>
    <ThemeSwitcher
      client:load
      themeState={themeState}
    />
  </body>
</html>
`,
    },
    secondary: `// src/lib/theme.ts
import {createTheme} from 'ssr-themes';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

// src/lib/theme-react.tsx
import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} =
  bindTheme(options);

// src/components/theme-switcher.tsx
import type {
  LightOrDark,
  ThemeState,
  WithSystem,
} from 'ssr-themes';
import {
  ThemeProvider,
  useTheme,
} from '../lib/theme-react';

type ThemeName = WithSystem<LightOrDark>;

function ThemeSelect() {
  const {selected, setSelected} = useTheme();

  return (
    <select
      value={selected ?? 'system'}
      onChange={event =>
        setSelected(event.target.value as ThemeName)
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}

export default function ThemeSwitcher({
  themeState,
}: {
  themeState?: ThemeState<LightOrDark>;
}) {
  return (
    <ThemeProvider initial={themeState}>
      <ThemeSelect />
    </ThemeProvider>
  );
}
`,
  },
  next: {
    primary: `// app/layout.tsx
import {headers} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {ThemeProvider} from './theme-react';
import {
  registerTheme,
  parseThemeCookie,
  themeScript,
} from './theme';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeState = parseThemeCookie(
    (await headers()).get('cookie'),
  );

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider {...themeState}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
    secondary: `// app/theme.ts
import {createTheme} from 'ssr-themes';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

// app/theme-react.tsx
'use client';

import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} =
  bindTheme(options);

// app/theme-switcher.tsx
'use client';

import {useTheme} from './theme-react';

type ThemeName =
  | 'system'
  | 'dark'
  | 'light';

export function ThemeSwitcher() {
  const {selected, setSelected} = useTheme();

  return (
    <select
      value={selected ?? 'system'}
      onChange={event =>
        setSelected(event.target.value as ThemeName)
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
`,
  },
  nuxt: {
    primary: {
      lang: 'vue',
      code: `<!-- app/app.vue -->
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
>('theme', () =>
  import.meta.client
    ? undefined
    : parseThemeCookie(
        useRequestHeaders(['cookie']).cookie,
      ),
);

const htmlAttrs = computed(() => {
  return {
    lang: 'en' as const,
    ...registerTheme(themeState.value, {
      renderMode: 'html-attrs',
    }),
  };
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
  <ThemeProvider :initial-state="themeState">
    <NuxtPage />
  </ThemeProvider>
</template>
`,
    },
    secondary: {
      lang: 'vue',
      code: `<!-- app/lib/theme.ts -->
import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/vue';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

export const {ThemeProvider, useTheme} =
  bindTheme(options);

<!-- app/components/theme-switcher.vue -->
<script setup lang="ts">
import {computed} from 'vue';
import {useTheme} from '../lib/theme';

type ThemeName =
  | 'system'
  | 'dark'
  | 'light';

const {setSelected, selected} = useTheme();
const selectedTheme = computed(
  () => selected.value ?? 'system',
);

const handleChange = (event: Event) => {
  const select =
    event.currentTarget as HTMLSelectElement;
  setSelected(select.value as ThemeName);
};
</script>

<template>
  <select @change="handleChange">
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
`,
    },
  },
  solid: {
    primary: `// src/app.tsx
import {Router} from '@solidjs/router';
import {FileRoutes} from '@solidjs/start/router';
import {Suspense} from 'solid-js';
import {
  getThemeState,
  ThemeProvider,
} from '~/lib/theme';

export default function App() {
  const themeState = getThemeState();

  return (
    <ThemeProvider {...(themeState ?? {})}>
      <Router
        root={props => (
          <Suspense>{props.children}</Suspense>
        )}
      >
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}

// src/entry-server.tsx
import {
  createHandler,
  StartServer,
} from '@solidjs/start/server';
import {
  getThemeState,
  registerTheme,
  themeScript,
} from '~/lib/theme';

export default createHandler(() => (
  <StartServer
    document={({assets, children, scripts}) => {
      const htmlProps = registerTheme(
        getThemeState(),
      );

      return (
        <html
          class={htmlProps.className}
          style={htmlProps.style}
        >
          <head>
            <script
              id="ssr-themes"
              innerHTML={themeScript()}
            />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      );
    }}
  />
));
`,
    secondary: `// src/lib/theme.ts
import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/solid';
import {getRequestEvent, isServer} from 'solid-js/web';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

export const {ThemeProvider, useTheme} =
  bindTheme(options);

export const getThemeState = () =>
  parseThemeCookie(
    isServer
      ? getRequestEvent()?.request.headers.get('cookie')
      : document.cookie,
  );

// src/components/theme-switcher.tsx
import {useTheme} from '~/lib/theme';

type ThemeName =
  | 'system'
  | 'dark'
  | 'light';

export function ThemeSwitcher() {
  const theme = useTheme();

  return (
    <select
      value={theme.selected() ?? 'system'}
      onChange={event =>
        theme.setSelected(
          event.currentTarget.value as ThemeName,
        )
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
`,
  },
  svelte: {
    primary: {
      lang: 'svelte',
      code: `<!-- src/app.html -->
<!doctype html>
<html %ssr-themes.html-attrs%>
  <head>
    <script id="ssr-themes">
      %ssr-themes.script%
    </script>
    %sveltekit.head%
  </head>
  <body>
    %sveltekit.body%
  </body>
</html>

// src/hooks.server.ts
import {
  getThemeState,
  htmlAttributesPlaceholder,
  renderThemeHtmlAttributes,
  renderThemeScript,
  themeScriptPlaceholder,
} from '$lib/theme';

export const handle = async ({event, resolve}) => {
  const themeState = getThemeState(
    event.request.headers.get('cookie'),
  );
  event.locals.themeState = themeState;

  return resolve(event, {
    transformPageChunk: ({html}) =>
      html
        .replace(
          htmlAttributesPlaceholder,
          renderThemeHtmlAttributes(themeState),
        )
        .replace(
          themeScriptPlaceholder,
          renderThemeScript(),
        ),
  });
};

// src/routes/+layout.server.ts
export const load = ({locals}) => ({
  themeState: locals.themeState,
});

<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import {ThemeProvider} from '$lib/theme';
  let {data, children} = $props();
</script>

<ThemeProvider
  {...(data.themeState ?? {})}
>
  {@render children()}
</ThemeProvider>
`,
    },
    secondary: {
      lang: 'svelte',
      code: `<!-- src/lib/theme.ts -->
 import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/svelte';

export const htmlAttributesPlaceholder =
  '%ssr-themes.html-attrs%';

export const themeScriptPlaceholder =
  '%ssr-themes.script%';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme({
  attribute: 'class',
  themes: ['dark', 'light'],
});

export const {ThemeProvider, useTheme} =
  bindTheme(options);

export const getThemeState = (
  cookieHeader: string | null | undefined,
) => parseThemeCookie(cookieHeader);

export const renderThemeHtmlAttributes = (
  themeState?: ReturnType<typeof getThemeState>,
) =>
  registerTheme(themeState, {
    renderMode: 'html-string',
  });

export const renderThemeScript = () =>
  themeScript();

<!-- src/lib/theme-switcher.svelte -->
<script lang="ts">
  import {useTheme} from '$lib/theme';

  const {setSelected, selected} = useTheme();

  type ThemeName =
    | 'system'
    | 'dark'
    | 'light';

  const handleChange = (event: Event) => {
    const select =
      event.currentTarget as HTMLSelectElement;
    setSelected(select.value as ThemeName);
  };
</script>

<select
  value={$selected ?? 'system'}
  on:change={handleChange}
>
  <option value="system">System</option>
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</select>
`,
    },
  },
  tanstack: {
    primary: `// src/routes/__root.tsx
import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import {
  registerTheme,
  ThemeProvider,
  parseThemeCookie,
  themeScript,
} from '../lib/theme';

const getThemeState = createServerFn({
  method: 'GET',
}).handler(() =>
  parseThemeCookie(getRequestHeader('cookie')),
);

function RootComponent() {
  const {themeState} = Route.useLoaderData();

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider {...(themeState ?? {})}>
          <ScriptOnce children={themeScript()} />
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  loader: async () => ({
    themeState: await getThemeState(),
  }),
  component: RootComponent,
});
`,
    secondary: `// src/lib/theme.ts
 import {createTheme} from 'ssr-themes';
import {bindTheme} from 'ssr-themes/react';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

export const {ThemeProvider, useTheme} =
  bindTheme(options);

// src/routes/index.tsx
import {createFileRoute} from '@tanstack/react-router';
import {useTheme} from '../lib/theme';

type ThemeName =
  | 'system'
  | 'dark'
  | 'light';

function Home() {
  const {selected, setSelected} = useTheme();

  return (
    <select
      value={selected ?? 'system'}
      onChange={event =>
        setSelected(event.target.value as ThemeName)
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
`,
  },
  other: {
    primary: `// app/root.tsx
import type {ReactNode} from 'react';
import {ThemeProvider} from './theme-react';
import {
  registerTheme,
  parseThemeCookie,
  themeScript,
} from './theme';

export function Root({
  cookieHeader,
  children,
}: {
  cookieHeader: string | null | undefined;
  children: ReactNode;
}) {
  const themeState = parseThemeCookie(
    cookieHeader,
  );

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <script id="ssr-themes">{themeScript()}</script>
      </head>
      <body>
        <ThemeProvider initial={themeState}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
    secondary: `// app/theme.ts
 import {createTheme} from 'ssr-themes';

export const {
  options,
  registerTheme,
  parseThemeCookie,
  themeScript,
} = createTheme();

// app/theme-react.tsx
'use client';

import {bindTheme} from 'ssr-themes/react';
import {options} from './theme';

export const {ThemeProvider, useTheme} =
  bindTheme(options);

// app/theme-switcher.tsx
'use client';

import {useTheme} from './theme-react';

type ThemeName =
  | 'system'
  | 'dark'
  | 'light';

export function ThemeSwitcher() {
  const {selected, setSelected} = useTheme();

  return (
    <select
      value={selected ?? 'system'}
      onChange={event =>
        setSelected(event.target.value as ThemeName)
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
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
