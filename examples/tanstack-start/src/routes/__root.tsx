import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import type {
  LightOrDark,
  ResolvedThemeState,
} from 'ssr-themes';
import {
  ThemeProvider,
  parseThemeCookie,
  registerTheme,
  themeScript,
} from '../lib/theme';
import appCss from '../styles.css?url';

const getThemeState = createServerFn({
  method: 'GET',
}).handler(() =>
  parseThemeCookie(getRequestHeader('cookie')),
);

function RootDocument({
  children,
  themeState,
}: {
  children: React.ReactNode;
  themeState?: ResolvedThemeState<LightOrDark>;
}) {
  return (
    <html {...registerTheme(themeState)}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white antialiased font-mono">
        <ThemeProvider initial={themeState}>
          <ScriptOnce children={themeScript()} />
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const {themeState} = Route.useLoaderData();
  return (
    <RootDocument themeState={themeState}>
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
