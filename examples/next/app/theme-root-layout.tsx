import type {Metadata} from 'next';
import {headers} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {
  registerTheme,
  themeFromCookieHeader,
  themeScript,
  type LightOrDark,
  type ThemeCookieState,
} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

export const metadata: Metadata = {
  title: 'ssr-themes example',
  description:
    'App Router theme switching with forced routes.',
};

type ThemeRootLayoutProps = {
  children: ReactNode;
  forcedTheme?: LightOrDark;
};

const getRegisterThemeOptions = (
  themeState:
    | ThemeCookieState<LightOrDark>
    | undefined,
  forcedTheme?: LightOrDark,
) =>
  forcedTheme
    ? {
        ...(themeState ?? {}),
        appliedTheme: forcedTheme,
      }
    : themeState;

export async function ThemeRootLayout({
  children,
  forcedTheme,
}: ThemeRootLayoutProps) {
  const themeState = themeFromCookieHeader(
    (await headers()).get('cookie'),
  );

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(
        getRegisterThemeOptions(
          themeState,
          forcedTheme,
        ),
      )}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white font-mono">
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript({forcedTheme})}
        </Script>
        <ThemeProvider
          forcedTheme={forcedTheme}
          selectedTheme={themeState?.selectedTheme}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
