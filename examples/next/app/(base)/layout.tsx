import {cookies} from 'next/headers';
import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes/client';

export default async function BaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const initialTheme =
    themeCookie === 'dark' ||
    themeCookie === 'light' ||
    themeCookie === 'system'
      ? themeCookie
      : undefined;

  return (
    <ThemeProvider initialTheme={initialTheme}>
      {children}
    </ThemeProvider>
  );
}
