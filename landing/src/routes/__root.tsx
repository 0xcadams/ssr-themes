import {Analytics} from '@vercel/analytics/react';
import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import {ThemeProvider} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes/server';
import faviconUrl from '../assets/favicon.svg?url';
import appCss from '../styles.css?url';

const themes = [
  'light',
  'dark',
  'quartz',
  'abyss',
] as const;

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie'), {
    themes,
  }),
);

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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          themes={themes}
          initialTheme={initialTheme}
        >
          <ScriptOnce
            children={themeScript({
              themes,
            })}
          />
          <Outlet />

          <Analytics />
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
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {title: 'ssr-themes'},
      {
        name: 'description',
        content:
          'SSR-friendly theming for React using cookies - with system preference, cross-tab sync, no flash, and a strongly typed useTheme hook.',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: faviconUrl,
      },
      {rel: 'stylesheet', href: appCss},
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
  }),
  component: RootComponent,
});
