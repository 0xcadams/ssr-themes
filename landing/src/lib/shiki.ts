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

const {
  className,
  style,
  ...themeHtmlProps
} = registerTheme(themeState);

// registerTheme(themeState) can use appliedTheme
// to pre-render <html>. Pass only selectedTheme
// into the client provider.
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
      selectedTheme={themeState?.selectedTheme}
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
  selectedTheme,
}: {
  selectedTheme?: ThemeName;
}) {
  return (
    <ThemeProvider selectedTheme={selectedTheme}>
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
import {headers} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeState = themeFromCookieHeader(
    (await headers()).get('cookie'),
  );

  // Use the full themeState for <html>, and keep the
  // logical selection for hydrated UI state.

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <Script id="ssr-themes" strategy="beforeInteractive">
          {themeScript()}
        </Script>
      </head>
      <body>
        <ThemeProvider
          selectedTheme={themeState?.selectedTheme}
        >
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
  if (import.meta.client) return undefined;

  return themeFromCookieHeader(
    useRequestHeaders(['cookie']).cookie,
  );
});

// Use the full themeState for SSR htmlAttrs, and pass
// only selectedTheme into the provider.

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
            match => \`-\${match.toLowerCase()}\`,
          );

      return \`\${property}: \${value}\`;
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
  <ThemeProvider
    :selected-theme="themeState?.selectedTheme"
  >
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
import {useTheme} from 'ssr-themes/vue';

type ThemeName = WithSystem<LightOrDark>;

const {setTheme, theme} = useTheme();

const selectedTheme = computed(
  () => theme.value ?? 'system',
);

const handleChange = (event: Event) => {
  const select = event.currentTarget as HTMLSelectElement;
  setTheme(select.value as ThemeName);
};
</script>

<template>
  <select
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
`,
    },
  },
  solid: {
    primary: `// src/lib/theme.ts
import {themeFromCookieHeader} from 'ssr-themes';
import {getRequestEvent, isServer} from 'solid-js/web';

export const getThemeState = () =>
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
import {getThemeState} from '~/lib/theme';

export default function App() {
  const themeState = getThemeState();

  // registerTheme(themeState) handles SSR html state.
  // selectedTheme keeps the logical client choice.

  return (
    <ThemeProvider
      selectedTheme={themeState?.selectedTheme}
    >
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
      const themeState = getThemeState();
      const htmlProps = registerTheme(themeState);

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
  const themeState = themeFromCookieHeader(
    event.request.headers.get('cookie'),
  );
  event.locals.themeState = themeState;

  return resolve(event, {
    transformPageChunk: ({html}) =>
      html
        .replace(
          '%ssr-themes.html-attrs%',
          registerTheme({
            attribute: 'class',
            ...themeState,
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

  // registerTheme() uses the full themeState during SSR.
  // Pass only selectedTheme to hydrated UI state.
  let {data, children} = $props();
</script>

<ThemeProvider
  selectedTheme={data.themeState?.selectedTheme}
>
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

const getThemeState = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie')),
);

export const Route = createRootRoute({
  loader: async () => ({
    themeState: await getThemeState(),
  }),
  staleTime: Infinity,
  shouldReload: false,
  component: RootComponent,
});

function RootComponent() {
  const {themeState} = Route.useLoaderData();

  // Use the full themeState for SSR html props, and keep
  // selectedTheme for hydrated UI state.

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          selectedTheme={themeState?.selectedTheme}
        >
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
import {registerTheme} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

const {themeState} = Route.useLoaderData();
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

const htmlTheme = forcedTheme
  ? {
      ...(themeState ?? {}),
      appliedTheme: forcedTheme,
    }
  : themeState;

// htmlTheme can override the applied SSR theme, while
// the provider still keeps the logical selectedTheme.
<html suppressHydrationWarning {...registerTheme(htmlTheme)}>
  <body>
    <ThemeProvider
      forcedTheme={forcedTheme}
      selectedTheme={themeState?.selectedTheme}
    >
      {children}
    </ThemeProvider>
  </body>
</html>;
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
  const themeState = themeFromCookieHeader(
    request.headers.get('cookie'),
  );
  const htmlProps = registerTheme(themeState);

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
