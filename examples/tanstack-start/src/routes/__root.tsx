import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router';
import {getCookie} from '@tanstack/react-start/server';
import * as React from 'react';
import {ThemeProvider, registerTheme, type SystemTheme} from 'ssr-themes';
import appCss from '../styles.css?url';

type ThemeStaticData = {
  theme?: SystemTheme;
};

type RootLoaderData = {
  initialTheme?: SystemTheme;
};

const getInitialTheme = (): SystemTheme | undefined => {
  const themeCookie = getCookie('theme');
  return themeCookie === 'dark' || themeCookie === 'light'
    ? themeCookie
    : undefined;
};

function RootDocument({
  children,
  forcedTheme,
  initialTheme,
}: {
  children: React.ReactNode;
  forcedTheme?: SystemTheme;
  initialTheme?: SystemTheme;
}) {
  const htmlProps = registerTheme({
    theme: forcedTheme ?? initialTheme,
    attribute: 'class',
  });

  return (
    <html suppressHydrationWarning {...htmlProps}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased font-mono">
        <ThemeProvider
          attribute="class"
          forcedTheme={forcedTheme}
          initialTheme={initialTheme}
        >
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  loader: (): RootLoaderData => ({
    initialTheme: getInitialTheme(),
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
    links: [{rel: 'stylesheet', href: appCss}],
  }),
  component: RootComponent,
});

function RootComponent() {
  const {initialTheme} = Route.useLoaderData();
  const matches = useMatches();
  const forcedTheme = React.useMemo(() => {
    return matches.reduce<SystemTheme | undefined>((theme, match) => {
      const staticData = match.staticData as ThemeStaticData | undefined;
      return staticData?.theme ?? theme;
    }, undefined);
  }, [matches]);

  return (
    <RootDocument forcedTheme={forcedTheme} initialTheme={initialTheme}>
      <Outlet />
    </RootDocument>
  );
}
