import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router';
import * as React from 'react';
import {
  ThemeProvider,
  type SystemTheme,
} from 'ssr-themes';
import {themeScript} from 'ssr-themes/server';
import appCss from '../styles.css?url';

type ThemeStaticData = {
  theme?: SystemTheme;
};

function RootDocument({
  children,
  forcedTheme,
}: {
  children: React.ReactNode;
  forcedTheme?: SystemTheme;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased font-mono">
        <ThemeProvider forcedTheme={forcedTheme}>
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const matches = useMatches();
  const forcedTheme = React.useMemo(() => {
    return matches.reduce<SystemTheme | undefined>(
      (theme, match) => {
        const staticData = match.staticData as
          | ThemeStaticData
          | undefined;
        return staticData?.theme ?? theme;
      },
      undefined,
    );
  }, [matches]);

  return (
    <RootDocument forcedTheme={forcedTheme}>
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
      {title: 'ssr-themes example'},
    ],
    links: [
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
      {rel: 'stylesheet', href: appCss},
    ],
    scripts: [
      {
        children: themeScript(),
      },
    ],
  }),
  component: RootComponent,
});
