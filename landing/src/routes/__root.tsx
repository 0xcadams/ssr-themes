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
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';
import faviconUrl from '../assets/favicon.svg?url';
import appCss from '../styles.css?url';

const themes = [
  'light',
  'dark',
  'quartz',
  'abyss',
] as const;

const getThemeState = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie'), {
    themes,
  }),
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          themes={themes}
          selectedTheme={themeState?.selectedTheme}
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
