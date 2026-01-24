'use client';

import type {ReactNode} from 'react';
import {ThemeProvider, type SystemTheme} from 'ssr-themes';

type ProvidersProps = {
  children: ReactNode;
  forcedTheme?: SystemTheme;
  initialTheme?: SystemTheme | 'system';
};

export default function Providers({
  children,
  forcedTheme,
  initialTheme,
}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      forcedTheme={forcedTheme}
      initialTheme={initialTheme}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
