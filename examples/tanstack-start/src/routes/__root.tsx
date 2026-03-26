import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader} from '@tanstack/react-start/server';
import * as React from 'react';
import {
  ThemeProvider,
  type SystemTheme,
  type ThemeName,
} from 'ssr-themes';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from 'ssr-themes/server';
import appCss from '../styles.css?url';

type ThemeStaticData = {
  theme?: SystemTheme;
};

type InitialTheme = ThemeName<SystemTheme>;

const getInitialTheme = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader<SystemTheme>(
    getRequestHeader('cookie'),
  ),
);

function RootDocument({
  children,
  forcedTheme,
  initialTheme,
}: {
  children: React.ReactNode;
  forcedTheme?: SystemTheme;
  initialTheme?: InitialTheme;
}) {
  const theme: SystemTheme | undefined =
    initialTheme && initialTheme !== 'system'
      ? initialTheme
      : undefined;

  return (
    <html
      suppressHydrationWarning
      {...registerTheme({theme})}
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased font-mono">
        <ThemeProvider
          forcedTheme={forcedTheme}
          initialTheme={initialTheme}
        >
          <ScriptOnce children={themeScript()} />
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const matches = useMatches();
  const {initialTheme} = Route.useLoaderData();
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
    <RootDocument
      forcedTheme={forcedTheme}
      initialTheme={initialTheme}
    >
      <Outlet />
    </RootDocument>
  );
}

export const Route = createRootRoute({
  loader: async () => ({
    initialTheme: await getInitialTheme(),
  }),
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
  }),
  component: RootComponent,
});
