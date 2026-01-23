'use client';

import type {ReactNode} from 'react';
import {ThemeProvider, type SystemTheme} from 'ssr-themes';

type ProvidersProps = {
  children: ReactNode;
  forcedTheme?: SystemTheme;
};

export default function Providers({children, forcedTheme}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      forcedTheme={forcedTheme}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
