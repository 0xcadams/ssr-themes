'use client';

import type {ReactNode} from 'react';
import {
  ThemeProvider,
  type SystemTheme,
} from 'ssr-themes';

type ProvidersProps = {
  children: ReactNode;
  forcedTheme?: SystemTheme;
  initialTheme?: SystemTheme;
};

export default function Providers({
  children,
  forcedTheme,
  initialTheme,
}: ProvidersProps) {
  return (
    <ThemeProvider
      forcedTheme={forcedTheme}
      initialTheme={initialTheme}
    >
      {children}
    </ThemeProvider>
  );
}
