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
import faviconUrl from '../assets/favicon.svg?url';
import appCss from '../styles.css?url';
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
    <html {...registerTheme(themeState)}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider initial={themeState}>
          <ScriptOnce children={themeScript()} />
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
    themeState: await getThemeState(),
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
          'SSR-safe dark mode and theming for TanStack Start, Next.js, and more',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: faviconUrl,
      },
      {rel: 'stylesheet', href: appCss},
    ],
  }),
  component: RootComponent,
});
