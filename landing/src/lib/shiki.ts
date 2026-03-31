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
  type ThemeHtmlProps,
} from 'ssr-themes';

const initialTheme = themeFromCookieHeader(
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

const {
  className,
  style,
  ...themeHtmlProps
} = registerTheme({initialTheme});
---

<html
  lang="en"
  class={className}
  style={styleToString(style)}
  {...themeHtmlProps}
>
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
      initialTheme={initialTheme}
    />
  </body>
</html>
`,
    },
    secondary: `// src/components/theme-switcher.tsx
import type {LightOrDark, WithSystem} from 'ssr-themes';
import {
  ThemeProvider,
  useTheme,
} from 'ssr-themes/react';

type ThemeName = WithSystem<LightOrDark>;

function ThemeSelect() {
  const {theme, setTheme} = useTheme<LightOrDark>();
  const value = theme ?? 'system';

  return (
    <select
      value={value}
      onChange={event =>
        setTheme(
          event.target.value as ThemeName,
        )
      }
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}

export default function ThemeSwitcher({
  initialTheme,
}: {
  initialTheme?: ThemeName;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeSelect />
    </ThemeProvider>
  );
}
`,
  },
  next: {
    primary: `// app/layout.tsx
import Script from 'next/script';
import type {ReactNode} from 'react';
import {themeScript} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <Script id="ssr-themes" strategy="beforeInteractive">
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
`,
    secondary: `// app/layout.tsx (SSR: pre-set the <html> theme)
import {cookies} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {registerTheme, themeScript} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';
import {lightOrDarkWithSystemSchema} from 'ssr-themes/zod';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeCookie = (await cookies()).get(
    'theme',
  )?.value;
  const parsedCookie =
    lightOrDarkWithSystemSchema.safeParse(themeCookie);
  const initialTheme = parsedCookie.success
    ? parsedCookie.data
    : undefined;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({initialTheme})}
    >
      <head>
        <Script id="ssr-themes" strategy="beforeInteractive">
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
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
      code: `<!-- app/app.vue -->
<script setup lang="ts">
import {computed} from 'vue';
import type {LightOrDark, WithSystem} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/vue';

const initialTheme = useState<
  WithSystem<LightOrDark> | undefined
>('theme', () => {
  if (import.meta.client) return undefined;

  return themeFromCookieHeader(
    useRequestHeaders(['cookie']).cookie,
  );
});

const htmlAttrs = computed(() => {
  const {className, style, ...dataAttrs} =
    registerTheme({
      initialTheme: initialTheme.value,
    });

  return {
    lang: 'en' as const,
    ...(className ? {class: className} : {}),
    ...(style ? {style} : {}),
    ...dataAttrs,
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
  <ThemeProvider :initial-theme="initialTheme">
    <NuxtPage />
  </ThemeProvider>
</template>
`,
    },
    secondary: {
      lang: 'vue',
      code: `<!-- app/components/theme-switcher.vue -->
<script setup lang="ts">
import type {LightOrDark, WithSystem} from 'ssr-themes';
import {useTheme} from 'ssr-themes/vue';

type ThemeName = WithSystem<LightOrDark>;

const {setTheme, theme} = useTheme();

const handleChange = (event: Event) => {
  const select = event.currentTarget as HTMLSelectElement;
  setTheme(select.value as ThemeName);
};
</script>

<template>
  <select
    :value="theme ?? 'system'"
    @change="handleChange"
  >
    <option value="system">System</option>
    <option value="dark">Dark</option>
    <option value="light">Light</option>
  </select>
</template>
`,
    },
  },
  solid: {
    primary: `// src/lib/theme.ts
import {themeFromCookieHeader} from 'ssr-themes';
import {getRequestEvent, isServer} from 'solid-js/web';

export const getInitialTheme = () =>
  themeFromCookieHeader(
    isServer
      ? getRequestEvent()?.request.headers.get('cookie')
      : document.cookie,
  );

// src/app.tsx
import {Router} from '@solidjs/router';
import {FileRoutes} from '@solidjs/start/router';
import {Suspense} from 'solid-js';
import {ThemeProvider} from 'ssr-themes/solid';
import {getInitialTheme} from '~/lib/theme';

export default function App() {
  const initialTheme = getInitialTheme();

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <Router root={props => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}

// src/entry-server.tsx
import {createHandler, StartServer} from '@solidjs/start/server';
import {registerTheme, themeScript} from 'ssr-themes';

export default createHandler(() => (
  <StartServer
    document={({assets, children, scripts}) => {
      const initialTheme = getInitialTheme();
      const htmlProps = registerTheme({initialTheme});

      return (
        <html class={htmlProps.className} style={htmlProps.style}>
          <head>
            <script innerHTML={themeScript()} />
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
    secondary: `// src/routes/index.tsx
import {useTheme} from 'ssr-themes/solid';

export default function Home() {
  const theme = useTheme();
  const value = () => theme.theme() ?? 'system';

  return (
    <select
      value={value()}
      onChange={event =>
        theme.setTheme(
          event.currentTarget.value as
            | 'system'
            | 'dark'
            | 'light',
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
<html lang="en" %ssr-themes.html-attrs%>
  <head>
    <script id="ssr-themes">
      %ssr-themes.script%
    </script>
  </head>

// src/hooks.server.ts
import type {Handle} from '@sveltejs/kit';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';

export const handle: Handle = async ({event, resolve}) => {
  const initialTheme = themeFromCookieHeader(
    event.request.headers.get('cookie'),
  );
  event.locals.initialTheme = initialTheme;

  return resolve(event, {
    transformPageChunk: ({html}) =>
      html
        .replace(
          '%ssr-themes.html-attrs%',
          registerTheme({
            attribute: 'class',
            initialTheme,
            renderMode: 'html-string',
          }),
        )
        .replace(
          '%ssr-themes.script%',
          themeScript(),
        ),
  });
};

<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import {ThemeProvider} from 'ssr-themes/svelte';

  let {data, children} = $props();
</script>

<ThemeProvider initialTheme={data.initialTheme}>
  {@render children()}
</ThemeProvider>
`,
    },
    secondary: {
      lang: 'svelte',
      code: `<!-- src/lib/theme-switcher.svelte -->
<script lang="ts">
  import type {
    LightOrDark,
    WithSystem,
  } from 'ssr-themes';
  import {getTheme} from 'ssr-themes/svelte';

  const {setTheme, theme} = getTheme<
    LightOrDark,
    true
  >();

  const handleChange = (event: Event) => {
    const select = event.currentTarget as HTMLSelectElement;
    setTheme(
      select.value as WithSystem<LightOrDark>,
    );
  };
</script>

<select
  value={$theme ?? 'system'}
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
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie')),
);

export const Route = createRootRoute({
  loader: async () => ({
    initialTheme: await getInitialTheme(),
  }),
  staleTime: Infinity,
  shouldReload: false,
  component: RootComponent,
});

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({initialTheme})}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <ScriptOnce children={themeScript()} />
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
`,
    secondary: `// src/routes/dark.tsx
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/dark')({
  staticData: {theme: 'dark'},
  component: () => <div>Always dark</div>,
});

// src/routes/__root.tsx
import {useMatches} from '@tanstack/react-router';
import type {LightOrDark} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const matches = useMatches();
const forcedTheme = matches.reduce<LightOrDark | undefined>(
  (theme, match) => {
    const staticData = match.staticData as
      | {theme?: LightOrDark}
      | undefined;
    return staticData?.theme ?? theme;
  },
  undefined,
);

<ThemeProvider forcedTheme={forcedTheme}>{children}</ThemeProvider>;
`,
  },
  other: {
    primary: `// root.tsx
import {themeScript} from 'ssr-themes';

const html = \`<html>
  <head>
    <script id="ssr-themes">\${themeScript()}</script>
  </head>
  <body><!-- ... --></body>
</html>\`;

// app.tsx
import {ThemeProvider} from 'ssr-themes/react';

export function App() {
  return (
    <ThemeProvider>
      {/* ... */}
    </ThemeProvider>
  );
}
`,
    secondary: `// Parse cookies + pre-set <html>
import {registerTheme, themeFromCookieHeader} from 'ssr-themes';

export function handleRequest(request: Request) {
  const initialTheme = themeFromCookieHeader(request.headers.get('cookie'));
  const htmlProps = registerTheme({initialTheme});

  // Spread htmlProps on <html> when rendering
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
