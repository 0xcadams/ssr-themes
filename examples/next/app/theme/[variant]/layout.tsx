import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {bindTheme} from 'ssr-themes/react';

import {
  decodeTheme,
  registerTheme,
  theme,
  themeScript,
  themeVariants,
} from '../../theme';

import '../../globals.css';

const {ThemeProvider} = bindTheme(theme);

export const metadata: Metadata = {
  title: 'ssr-themes example',
  description:
    'Cache-friendly App Router theme switching with proxy rewrites.',
};

export const dynamicParams = false;

export function generateStaticParams() {
  return themeVariants().map(
    (variant: {value: string}) => ({
      variant: variant.value,
    }),
  );
}

type ThemedLayoutProps = {
  children: ReactNode;
  params: Promise<{variant: string}>;
};

export default async function ThemedLayout({
  children,
  params,
}: ThemedLayoutProps) {
  const {variant} = await params;
  const themeState = decodeTheme(variant);

  if (!themeState) {
    notFound();
  }

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
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
      <body className="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white">
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript()}
        </Script>
        <ThemeProvider
          initialColorScheme={themeState.colorScheme}
          selectedTheme={themeState.selectedTheme}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
