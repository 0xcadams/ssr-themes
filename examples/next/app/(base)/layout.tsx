import {headers} from 'next/headers';
import type {ReactNode} from 'react';
import {themeFromCookieHeader} from 'ssr-themes';
import {ThemeProvider} from 'ssr-themes/react';

export default async function BaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const themeState = themeFromCookieHeader(
    (await headers()).get('cookie'),
  );

  return (
    <ThemeProvider
      selectedTheme={themeState?.selectedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
