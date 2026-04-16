import type {Metadata} from 'next';
import Script from 'next/script';
import type {ReactNode} from 'react';
import {bindTheme} from 'ssr-themes/react';

import {
  decodeVariant,
  listVariants,
  registerTheme,
  theme,
  themeScript,
} from '../../theme';

import '../../globals.css';

const {ThemeProvider} = bindTheme(theme);

export const metadata: Metadata = {
  title: 'ssr-themes next.js example',
  description:
    'Cache-friendly App Router theme switching with proxy rewrites.',
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listVariants().map(variant => ({
    variant: variant.value,
  }));
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
  const themeState = decodeVariant(variant);

  return (
    <html
      suppressHydrationWarning
      {...registerTheme(themeState)}
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white font-mono text-black antialiased dark:bg-black dark:text-white">
        <Script
          id="ssr-themes"
          strategy="beforeInteractive"
        >
          {themeScript()}
        </Script>
        <ThemeProvider initial={themeState}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Font helpers for the example, not related to ssr-themes.
const HeadContent = () => (
  <>
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
  </>
);
