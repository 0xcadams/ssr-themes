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
import type {
  LightOrDark,
  ThemeCookieState,
} from 'ssr-themes';
import {
  ThemeProvider,
  registerTheme,
  themeFromCookieHeader,
  themeScript,
} from '../lib/theme';
import appCss from '../styles.css?url';

type ThemeStaticData = {
  theme?: LightOrDark;
};

const getThemeState = createServerFn({
  method: 'GET',
}).handler(() =>
  themeFromCookieHeader(getRequestHeader('cookie')),
);

function RootDocument({
  children,
  forcedTheme,
  themeState,
}: {
  children: React.ReactNode;
  forcedTheme?: LightOrDark;
  themeState?: ThemeCookieState<LightOrDark>;
}) {
  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState, {forcedTheme})}
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased font-mono">
        <ThemeProvider
          {...(themeState ?? {})}
          forcedTheme={forcedTheme}
        >
          <ScriptOnce
            children={themeScript({forcedTheme})}
          />
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const matches = useMatches();
  const {themeState} = Route.useLoaderData();
  const forcedTheme = React.useMemo(() => {
    return matches.reduce<LightOrDark | undefined>(
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
      themeState={themeState}
    >
      <Outlet />
    </RootDocument>
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
      {title: 'ssr-themes tanstack start example'},
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
