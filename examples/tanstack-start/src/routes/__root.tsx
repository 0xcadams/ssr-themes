import {
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import type {
  LightOrDark,
  ResolvedThemeState,
} from 'ssr-themes';
import {
  ThemeProvider,
  decodeVariant,
  defaultVariant,
  registerTheme,
  themeScript,
} from '../lib/theme';
import appCss from '../styles.css?url';

const themeRoutePrefix = '/theme/';

const getThemeStateFromPath = (
  pathname: string,
): ResolvedThemeState<LightOrDark> | undefined => {
  if (!pathname.startsWith(themeRoutePrefix)) {
    return decodeVariant(defaultVariant);
  }

  const variant = decodeURIComponent(
    pathname.slice(themeRoutePrefix.length),
  );

  return decodeVariant(variant ?? defaultVariant);
};

function RootDocument({
  children,
  themeState,
}: {
  children: React.ReactNode;
  themeState?: ResolvedThemeState<LightOrDark>;
}) {
  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
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
  loader: ({location}) => ({
    themeState: getThemeStateFromPath(
      location.pathname,
    ),
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
