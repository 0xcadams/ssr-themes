import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import appCss from './app.css?url';
import {
  ThemeProvider,
  parseThemeCookie,
  registerTheme,
  themeScript,
} from './lib/theme';

export const links: Route.LinksFunction = () => [
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
];

export function loader({request}: Route.LoaderArgs) {
  return parseThemeCookie(
    request.headers.get('cookie'),
  );
}

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeState =
    useRouteLoaderData<typeof loader>('root');

  return (
    <html lang="en" {...registerTheme(themeState)}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
        <script
          id="ssr-themes"
          dangerouslySetInnerHTML={{
            __html: themeScript(),
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white">
        <ThemeProvider initial={themeState}>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
