import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {registerTheme, type ThemeOptions} from 'ssr-themes';
import {themeScript} from 'ssr-themes/server';

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

  return (
    <html suppressHydrationWarning {...registerTheme({theme})}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
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
        <Script id="ssr-themes" strategy="beforeInteractive">
          {themeScript()}
        </Script>
        {children}
      </body>
    </html>
  );
}
