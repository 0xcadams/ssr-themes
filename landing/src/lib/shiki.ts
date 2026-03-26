import {codeToHtml} from 'shiki';

export type FrameworkId =
  | 'next'
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
import {ThemeProvider} from 'ssr-themes/client';
import {themeScript} from 'ssr-themes/server';

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
import {ThemeProvider} from 'ssr-themes/client';
import {registerTheme, themeScript} from 'ssr-themes/server';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeCookie = (await cookies()).get('theme')?.value;
  const initialTheme =
    themeCookie === 'dark' ||
    themeCookie === 'light' ||
    themeCookie === 'system'
      ? themeCookie
      : undefined;
  const theme =
    initialTheme === 'dark' || initialTheme === 'light'
      ? initialTheme
      : undefined;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({theme})}
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
import {ThemeProvider} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes/server';

const getInitialTheme = createServerFn({method: 'GET'}).handler(
  () => themeFromCookieHeader(getRequestHeader('cookie')),
);

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();
  const theme =
    initialTheme && initialTheme !== 'system'
      ? initialTheme
      : undefined;

  return (
    <html suppressHydrationWarning {...registerTheme({theme})}>
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

export const Route = createRootRoute({
  loader: async () => ({
    initialTheme: await getInitialTheme(),
  }),
  staleTime: Infinity,
  shouldReload: false,
  component: RootComponent,
});
`,
    secondary: `// src/routes/dark.tsx
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/dark')({
  staticData: {theme: 'dark'},
  component: () => <div>Always dark</div>,
});

// src/routes/__root.tsx
import {useMatches} from '@tanstack/react-router';
import {ThemeProvider, type SystemTheme} from 'ssr-themes';

const matches = useMatches();
const forcedTheme = matches.reduce<SystemTheme | undefined>(
  (theme, match) => {
    const staticData = match.staticData as
      | {theme?: SystemTheme}
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
import {themeScript} from 'ssr-themes/server';

const html = \`<html>
  <head>
    <script id="ssr-themes">\${themeScript()}</script>
  </head>
  <body><!-- ... --></body>
</html>\`;

// app.tsx
import {ThemeProvider} from 'ssr-themes';

export function App() {
  return (
    <ThemeProvider>
      {/* ... */}
    </ThemeProvider>
  );
}
`,
    secondary: `// Parse cookies + pre-set <html>
import {registerTheme, themeFromCookieHeader} from 'ssr-themes/server';

export function handleRequest(request: Request) {
  const theme = themeFromCookieHeader(request.headers.get('cookie'));
  const htmlProps = registerTheme({theme});

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
