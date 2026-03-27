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
  ThemeProvider,
  type ThemeName,
} from 'ssr-themes';
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

type AppTheme = (typeof themes)[number];
type InitialTheme = ThemeName<AppTheme>;

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader<AppTheme>(
    getRequestHeader('cookie'),
    {themes},
  ),
);

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();
  const theme: AppTheme | undefined =
    initialTheme && initialTheme !== 'system'
      ? initialTheme
      : undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      {...registerTheme({theme})}
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          themes={themes}
          initialTheme={initialTheme as InitialTheme}
        >
          <ScriptOnce
            children={themeScript({
              themes,
            })}
          />
          <Outlet />

          <Analytics
            scriptSrc="/api/insights/script.js"
            eventEndpoint="/api/insights/event"
            sessionEndpoint="/api/insights/session"
            viewEndpoint="/api/insights/view"
          />
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
