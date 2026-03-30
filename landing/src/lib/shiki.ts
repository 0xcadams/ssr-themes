import {codeToHtml} from 'shiki';

export type FrameworkId =
  | 'next'
  | 'solid'
  | 'tanstack'
  | 'other';

type FrameworkSnippets = Record<
  FrameworkId,
  {
    primary: string;
    secondary: string;
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

const highlightCode = (code: string) =>
  codeToHtml(code, {
    lang: 'tsx',
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  });

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
