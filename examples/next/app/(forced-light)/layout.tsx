import type {ReactNode} from 'react';
import {ThemeProvider} from 'ssr-themes/client';

export default function ForcedLightLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider forcedTheme="light">
      {children}
    </ThemeProvider>
  );
}
