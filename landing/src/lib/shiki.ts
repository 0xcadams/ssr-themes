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
import {ThemeProvider, type LightOrDark} from 'ssr-themes';

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
