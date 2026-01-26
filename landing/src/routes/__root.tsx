import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import * as React from 'react';
import {ThemeProvider, themeScript} from 'ssr-themes';
import faviconUrl from '../assets/favicon.svg?url';
import appCss from '../styles.css?url';

function RootDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          themes={['light', 'dark', 'quartz', 'abyss']}
        >
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

export const Route = createRootRoute({
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
    scripts: [
      {
        children: themeScript(),
      },
    ],
  }),
  component: RootComponent,
});
