import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import type {ReactNode} from 'react';
import {registerTheme} from 'ssr-themes';

import './globals.css';

export const metadata: Metadata = {
  title: 'ssr-themes example',
  description: 'App Router theme switching with forced routes.',
};

export default async function RootLayout({children}: {children: ReactNode}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const theme =
    themeCookie === 'dark' || themeCookie === 'light' ? themeCookie : undefined;
  const themeProps = registerTheme({theme, attribute: 'data-theme'});

  return (
    <html suppressHydrationWarning {...themeProps}>
      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
